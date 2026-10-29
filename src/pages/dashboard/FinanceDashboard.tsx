import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Download, Plus } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { DeltaBadge, Badge, TxStatusBadge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Form';
import { PageHeader, StatCard } from '@/components/ui/misc';
import { useToast } from '@/components/ui/Toast';
import { CashflowChart } from '@/components/charts/CashflowChart';
import { ExpenseDonut } from '@/components/charts/ExpenseDonut';
import { cashflowSeries, expenseBreakdown, financeSummary, receivables } from '@/data/selectors';
import { useData } from '@/providers/DataProvider';
import { useSettings } from '@/providers/SettingsProvider';
import { change, useFormat } from '@/lib/format';
import { inRange, rangePresets, resolveRange, type RangePreset } from '@/lib/date';
import { downloadCsv } from '@/lib/csv';
import type { Transaction } from '@/data/types';

export default function FinanceDashboard() {
  const { transactions, invoices, bills } = useData();
  const { chart } = useSettings();
  const f = useFormat();
  const toast = useToast();
  const [preset, setPreset] = useState<RangePreset>('ytd');
  const range = useMemo(() => resolveRange(preset), [preset]);
  const presetLabel = rangePresets.find((p) => p.value === preset)!.label;

  const { current, previous } = useMemo(() => financeSummary(transactions, range), [transactions, range]);
  const series = useMemo(() => cashflowSeries(transactions, range), [transactions, range]);
  const breakdown = useMemo(() => expenseBreakdown(transactions, range), [transactions, range]);
  const ar = useMemo(() => receivables(invoices), [invoices]);
  const recent = useMemo(() => transactions.filter((t) => inRange(t.date, range)).slice(0, 6), [transactions, range]);
  const margin = current.revenue ? (current.profit / current.revenue) * 100 : 0;
  const vs = previous ? `vs ${f.moneyShort(previous.revenue)} previous period` : 'No earlier data to compare';

  const exportRange = () => {
    const n = downloadCsv<Transaction>(`transactions_${range.from}_${range.to}`, current.scoped, [
      { header: 'ID', value: (t) => t.id },
      { header: 'Date', value: (t) => t.date },
      { header: 'Party', value: (t) => t.party },
      { header: 'Type', value: (t) => t.type },
      { header: 'Category', value: (t) => t.category },
      { header: 'Amount', value: (t) => (t.type === 'income' ? t.amount : -t.amount).toFixed(2) },
      { header: 'Status', value: (t) => t.status },
      { header: 'Reference', value: (t) => t.reference ?? '' },
    ]);
    toast({ title: 'Export ready', description: `${n} transactions · ${presetLabel}` });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Financial overview"
        description={`${f.date(range.from)} – ${f.date(range.to)} · All entities`}
        actions={
          <>
            <label className="relative">
              <span className="sr-only">Date range</span>
              <CalendarDays aria-hidden className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted" />
              <Select value={preset} onChange={(e) => setPreset(e.target.value as RangePreset)} className="w-[188px] pl-9 font-medium">
                {rangePresets.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </label>
            <Button variant="secondary" onClick={exportRange}>
              <Download className="h-4 w-4" aria-hidden />
              Export
            </Button>
            <ButtonLink to="/invoices/new">
              <Plus className="h-4 w-4" aria-hidden />
              New invoice
            </ButtonLink>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue"
          value={f.moneyShort(current.revenue)}
          badge={<DeltaBadge value={previous ? change(current.revenue, previous.revenue) : null} />}
          footnote={vs}
        />
        <StatCard
          label="Expenses"
          value={f.moneyShort(current.expenses)}
          badge={<DeltaBadge invert value={previous ? change(current.expenses, previous.expenses) : null} />}
          footnote={previous ? `vs ${f.moneyShort(previous.expenses)} previous period` : 'No earlier data to compare'}
        />
        <StatCard
          label="Net profit"
          value={f.moneyShort(current.profit)}
          badge={<DeltaBadge value={previous ? change(current.profit, previous.profit) : null} />}
          footnote={`${margin.toFixed(1)}% margin`}
        />
        <StatCard
          label="Outstanding"
          value={f.moneyShort(ar.amount)}
          badge={ar.overdueCount ? <Badge tone="strong">{ar.overdueCount} overdue</Badge> : undefined}
          footnote={
            <Link to="/invoices?status=overdue" className="font-medium text-primary-text hover:underline">
              {ar.openCount} open invoices · view
            </Link>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="min-w-0 xl:col-span-2">
          <CardHeader
            title="Revenue vs expenses"
            description={`${series.granularity === 'month' ? 'Monthly' : series.granularity === 'week' ? 'Weekly' : 'Daily'} · ${presetLabel}`}
            actions={
              <div className="flex gap-4 text-[13px] text-fg-2">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: chart.primary }} />
                  Revenue
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: chart.expense }} />
                  Expenses
                </span>
              </div>
            }
          />
          <CardBody className="pt-4">
            <CashflowChart points={series.points} granularity={series.granularity} />
          </CardBody>
        </Card>
        <Card className="min-w-0">
          <CardHeader title="Expense breakdown" description={presetLabel} />
          <CardBody className="pt-4">
            <ExpenseDonut data={breakdown} />
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="min-w-0 xl:col-span-2">
          <CardHeader
            title="Recent transactions"
            description={`${current.count} in this period`}
            actions={
              <Link to="/transactions" className="text-sm font-semibold text-primary-text hover:underline">
                View all
              </Link>
            }
          />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] whitespace-nowrap text-sm" aria-label="Recent transactions">
              <thead>
                <tr className="bg-surface-2 text-left text-xs uppercase tracking-[0.05em] text-muted">
                  <th scope="col" className="px-6 py-3 font-semibold">Reference</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Party</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Category</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Date</th>
                  <th scope="col" className="px-3 py-3 text-right font-semibold">Amount</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id} className="border-t border-line">
                    <td className="px-6 py-3.5 text-muted">{t.reference ?? t.id}</td>
                    <td className="px-3 py-3.5 font-semibold">{t.party}</td>
                    <td className="px-3 py-3.5 text-fg-2">{t.category}</td>
                    <td className="px-3 py-3.5 text-fg-2">{f.date(t.date)}</td>
                    <td className="px-3 py-3.5 text-right font-semibold">
                      {t.type === 'income' ? '+' : '−'}
                      {f.money(t.amount)}
                    </td>
                    <td className="px-6 py-3.5">
                      <TxStatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="flex min-w-0 flex-col">
          <CardHeader title="Upcoming payments" description="Next 14 days" />
          <CardBody className="flex flex-1 flex-col pt-2">
            <ul className="flex flex-col">
              {bills.map((b) => (
                <li key={b.id} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
                  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[10px] bg-surface-2 leading-tight ring-1 ring-inset ring-line">
                    <span className="text-[10px] font-semibold uppercase text-muted">{f.month(b.dueDate)}</span>
                    <span className="text-base font-bold">{Number(b.dueDate.slice(8))}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{b.name}</p>
                    <p className="truncate text-xs text-muted">{b.detail}</p>
                  </div>
                  <span className="text-sm font-semibold">{f.moneyShort(b.amount)}</span>
                </li>
              ))}
            </ul>
            <ButtonLink to="/transactions?type=expense" variant="secondary" className="mt-auto w-full">
              Manage payables
            </ButtonLink>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
