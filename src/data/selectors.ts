import {
  bucketOf,
  buckets,
  granularityFor,
  inRange,
  previousRange,
  type DateRange,
  type Granularity,
} from '@/lib/date';
import { percentages, round2, sum } from '@/lib/utils';
import { invoiceTotals } from './generate';
import type { ExpenseCategory, Invoice, Transaction } from './types';

export const expenseCategories: ExpenseCategory[] = ['Payroll', 'Operations', 'Marketing', 'Software', 'Other'];

export function totals(txs: Transaction[], range: DateRange) {
  const scoped = txs.filter((t) => inRange(t.date, range));
  const revenue = round2(sum(scoped.filter((t) => t.type === 'income').map((t) => t.amount)));
  const expenses = round2(sum(scoped.filter((t) => t.type === 'expense').map((t) => t.amount)));
  return { revenue, expenses, profit: round2(revenue - expenses), count: scoped.length, scoped };
}

export function financeSummary(txs: Transaction[], range: DateRange) {
  const current = totals(txs, range);
  const prevRange = previousRange(range);
  const earliest = txs.length ? txs[txs.length - 1]!.date : range.from;
  // Only compare when the previous period is fully covered by data.
  const previous = prevRange.from >= earliest ? totals(txs, prevRange) : null;
  return { current, previous, prevRange };
}

export interface SeriesPoint {
  key: string;
  revenue: number;
  expenses: number;
}

export function cashflowSeries(txs: Transaction[], range: DateRange): { points: SeriesPoint[]; granularity: Granularity } {
  const g = granularityFor(range);
  const keys = buckets(range, g);
  const map = new Map<string, SeriesPoint>(keys.map((k) => [k, { key: k, revenue: 0, expenses: 0 }]));
  for (const t of txs) {
    if (!inRange(t.date, range)) continue;
    const p = map.get(bucketOf(t.date, g));
    if (!p) continue;
    if (t.type === 'income') p.revenue += t.amount;
    else p.expenses += t.amount;
  }
  const points = [...map.values()].map((p) => ({ ...p, revenue: round2(p.revenue), expenses: round2(p.expenses) }));
  return { points, granularity: g };
}

export function expenseBreakdown(txs: Transaction[], range: DateRange) {
  const amounts = expenseCategories.map((c) =>
    round2(sum(txs.filter((t) => t.type === 'expense' && t.category === c && inRange(t.date, range)).map((t) => t.amount))),
  );
  const pcts = percentages(amounts);
  return expenseCategories.map((category, i) => ({ category, amount: amounts[i]!, percent: pcts[i]! }));
}

export function receivables(invoices: Invoice[]) {
  const open = invoices.filter((i) => i.status === 'pending' || i.status === 'overdue');
  const overdue = open.filter((i) => i.status === 'overdue');
  return {
    amount: round2(sum(open.map((i) => invoiceTotals(i).total))),
    openCount: open.length,
    overdueCount: overdue.length,
    overdueAmount: round2(sum(overdue.map((i) => invoiceTotals(i).total))),
  };
}
