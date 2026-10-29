import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { InvoiceStatusBadge } from '@/components/ui/Badge';
import { PageHeader, Segmented, StatCard } from '@/components/ui/misc';
import { useToast } from '@/components/ui/Toast';
import { customerById } from '@/data/customers';
import { invoiceTotals } from '@/data/generate';
import type { Invoice, InvoiceStatus } from '@/data/types';
import { useData } from '@/providers/DataProvider';
import { downloadCsv } from '@/lib/csv';
import { TODAY, diffDays } from '@/lib/date';
import { useFormat } from '@/lib/format';
import { initials, round2, sum } from '@/lib/utils';

type Filter = 'all' | InvoiceStatus;

interface Row extends Invoice {
  company: string;
  email: string;
  total: number;
}

export default function InvoiceList() {
  const { invoices } = useData();
  const f = useFormat();
  const toast = useToast();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const filter = (params.get('status') as Filter) || 'all';
  const q = params.get('q') ?? '';

  const setParam = (key: string, value: string, empty: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === empty) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const rows = useMemo<Row[]>(
    () =>
      invoices.map((inv) => {
        const c = customerById.get(inv.customerId);
        return { ...inv, company: c?.company ?? '—', email: c?.email ?? '', total: invoiceTotals(inv).total };
      }),
    [invoices],
  );

  const stat = (s?: InvoiceStatus) => {
    const list = s ? rows.filter((r) => r.status === s) : rows;
    return { count: list.length, amount: round2(sum(list.map((r) => r.total))) };
  };
  const all = stat();
  const paid = stat('paid');
  const pending = stat('pending');
  const overdue = stat('overdue');
  const draft = stat('draft');

  const filtered = useMemo(() => (filter === 'all' ? rows : rows.filter((r) => r.status === filter)), [rows, filter]);

  const columns = useMemo<ColumnDef<Row, any>[]>(
    () => [
      {
        accessorKey: 'number',
        header: 'Invoice',
        cell: ({ row }) => (
          <Link to={`/invoices/${row.original.id}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-fg hover:text-primary-text hover:underline">
            {row.original.number}
          </Link>
        ),
      },
      {
        accessorKey: 'company',
        header: 'Client',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs font-bold text-fg-2 ring-1 ring-inset ring-line" aria-hidden>
              {initials(row.original.company)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{row.original.company}</p>
              <p className="truncate text-xs text-muted">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      { accessorKey: 'issueDate', header: 'Issued', cell: ({ row }) => <span className="text-fg-2">{f.date(row.original.issueDate)}</span> },
      {
        accessorKey: 'dueDate',
        header: 'Due',
        cell: ({ row }) => {
          const r = row.original;
          const days = diffDays(TODAY, r.dueDate);
          return (
            <div>
              <p className="text-fg-2">{f.date(r.dueDate)}</p>
              {r.status === 'overdue' && <p className="text-xs font-medium text-warning">{days} days late</p>}
            </div>
          );
        },
      },
      {
        accessorKey: 'total',
        header: 'Amount',
        meta: { align: 'right' },
        cell: ({ row }) => <span className="font-semibold">{f.money(row.original.total)}</span>,
      },
      { accessorKey: 'status', header: 'Status', cell: ({ row }) => <InvoiceStatusBadge status={row.original.status} /> },
    ],
    [f],
  );

  const onExport = (list: Row[]) => {
    const n = downloadCsv('invoices', list, [
      { header: 'Invoice', value: (r) => r.number },
      { header: 'Client', value: (r) => r.company },
      { header: 'Email', value: (r) => r.email },
      { header: 'Issued', value: (r) => r.issueDate },
      { header: 'Due', value: (r) => r.dueDate },
      { header: 'Total', value: (r) => r.total.toFixed(2) },
      { header: 'Status', value: (r) => r.status },
      { header: 'Paid on', value: (r) => r.paidDate ?? '' },
    ]);
    toast({ title: 'Export ready', description: `${n} invoices downloaded as CSV.` });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invoices"
        description="Bill clients, track payments and follow up on overdue balances."
        actions={
          <ButtonLink to="/invoices/new">
            <Plus className="h-4 w-4" aria-hidden />
            New invoice
          </ButtonLink>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total invoiced" value={f.moneyShort(all.amount)} footnote={`${all.count} invoices`} />
        <StatCard label="Paid" value={f.moneyShort(paid.amount)} footnote={`${paid.count} invoices`} />
        <StatCard label="Pending" value={f.moneyShort(pending.amount)} footnote={`${pending.count} awaiting payment`} />
        <StatCard label="Overdue" value={<span className="text-warning">{f.moneyShort(overdue.amount)}</span>} footnote={`${overdue.count} past due date`} />
      </div>

      <Card className="overflow-hidden">
        <DataTable
          label="Invoices"
          data={filtered}
          columns={columns}
          search={q}
          onSearchChange={(v) => setParam('q', v, '')}
          searchPlaceholder="Search invoice # or client…"
          initialSorting={[{ id: 'issueDate', desc: true }]}
          onExport={onExport}
          onRowClick={(r) => navigate(`/invoices/${r.id}`)}
          minWidth={760}
          filters={
            <Segmented<Filter>
              label="Filter by status"
              value={filter}
              onChange={(v) => setParam('status', v, 'all')}
              options={[
                { value: 'all', label: 'All', count: all.count },
                { value: 'paid', label: 'Paid', count: paid.count },
                { value: 'pending', label: 'Pending', count: pending.count },
                { value: 'overdue', label: 'Overdue', count: overdue.count },
                { value: 'draft', label: 'Draft', count: draft.count },
              ]}
            />
          }
        />
      </Card>
    </div>
  );
}
