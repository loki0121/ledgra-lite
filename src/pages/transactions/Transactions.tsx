import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { TxStatusBadge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Form';
import { PageHeader, Segmented, StatCard } from '@/components/ui/misc';
import { useToast } from '@/components/ui/Toast';
import { expenseCategories } from '@/data/selectors';
import type { Transaction } from '@/data/types';
import { useData } from '@/providers/DataProvider';
import { downloadCsv } from '@/lib/csv';
import { useFormat } from '@/lib/format';
import { cn, round2, sum } from '@/lib/utils';

type TypeFilter = 'all' | 'income' | 'expense';

export default function Transactions() {
  const { transactions } = useData();
  const f = useFormat();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const type = (params.get('type') as TypeFilter) || 'all';
  const category = params.get('category') ?? 'all';
  const status = params.get('status') ?? 'all';
  const q = params.get('q') ?? '';

  const setParam = (key: string, value: string, empty = 'all') => {
    const next = new URLSearchParams(params);
    if (!value || value === empty) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const filtered = useMemo(
    () =>
      transactions.filter(
        (t) =>
          (type === 'all' || t.type === type) &&
          (category === 'all' || t.category === category) &&
          (status === 'all' || t.status === status),
      ),
    [transactions, type, category, status],
  );

  const income = round2(sum(filtered.filter((t) => t.type === 'income').map((t) => t.amount)));
  const outgoing = round2(sum(filtered.filter((t) => t.type === 'expense').map((t) => t.amount)));

  const columns = useMemo<ColumnDef<Transaction, any>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => <span className="text-muted">{row.original.id}</span>,
      },
      {
        accessorKey: 'party',
        header: 'Party',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                row.original.type === 'income' ? 'bg-primary/10 text-primary-text' : 'bg-warning-soft text-warning',
              )}
              aria-hidden
            >
              {row.original.type === 'income' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{row.original.party}</p>
              {row.original.reference && <p className="text-xs text-muted">{row.original.reference}</p>}
            </div>
          </div>
        ),
      },
      { accessorKey: 'category', header: 'Category', cell: (c) => <span className="text-fg-2">{c.getValue() as string}</span> },
      { accessorKey: 'method', header: 'Method', enableSorting: false, cell: (c) => <span className="text-fg-2">{c.getValue() as string}</span> },
      { accessorKey: 'date', header: 'Date', cell: ({ row }) => <span className="text-fg-2">{f.date(row.original.date)}</span> },
      {
        id: 'amount',
        accessorFn: (t) => (t.type === 'income' ? t.amount : -t.amount),
        header: 'Amount',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="font-semibold">
            {row.original.type === 'income' ? '+' : '−'}
            {f.money(row.original.amount)}
          </span>
        ),
      },
      { accessorKey: 'status', header: 'Status', cell: ({ row }) => <TxStatusBadge status={row.original.status} /> },
    ],
    [f],
  );

  const onExport = (rows: Transaction[]) => {
    const n = downloadCsv('transactions', rows, [
      { header: 'ID', value: (t) => t.id },
      { header: 'Date', value: (t) => t.date },
      { header: 'Party', value: (t) => t.party },
      { header: 'Type', value: (t) => t.type },
      { header: 'Category', value: (t) => t.category },
      { header: 'Method', value: (t) => t.method },
      { header: 'Amount', value: (t) => (t.type === 'income' ? t.amount : -t.amount).toFixed(2) },
      { header: 'Status', value: (t) => t.status },
      { header: 'Reference', value: (t) => t.reference ?? '' },
    ]);
    toast({ title: 'Export ready', description: `${n} transactions downloaded as CSV.` });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Transactions" description="Every payment in and out of the business. Income is created when an invoice is marked paid." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Money in" value={f.moneyShort(income)} icon={ArrowDownLeft} footnote="Matching current filters" />
        <StatCard label="Money out" value={f.moneyShort(outgoing)} icon={ArrowUpRight} footnote="Matching current filters" />
        <StatCard label="Net" value={f.moneyShort(income - outgoing)} footnote={`${filtered.length} transactions`} />
      </div>

      <Card className="overflow-hidden">
        <DataTable
          label="Transactions"
          data={filtered}
          columns={columns}
          search={q}
          onSearchChange={(v) => setParam('q', v, '')}
          searchPlaceholder="Search party, ID, invoice…"
          initialSorting={[{ id: 'date', desc: true }]}
          onExport={onExport}
          filters={
            <>
              <Segmented<TypeFilter>
                label="Transaction type"
                value={type}
                onChange={(v) => setParam('type', v)}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'income', label: 'Income' },
                  { value: 'expense', label: 'Expenses' },
                ]}
              />
              <Select aria-label="Category" value={category} onChange={(e) => setParam('category', e.target.value)} className="w-[160px]">
                <option value="all">All categories</option>
                <option value="Sales">Sales</option>
                {expenseCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <Select aria-label="Status" value={status} onChange={(e) => setParam('status', e.target.value)} className="w-[150px]">
                <option value="all">All statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </Select>
            </>
          }
        />
      </Card>
    </div>
  );
}
