/**
 * Date helpers. Dates in the data layer are ISO strings ('2026-10-28') so
 * they sort, compare and serialize without timezone surprises.
 */
export type ISODate = string;

/** The demo's "today". Replace with `toISO(new Date())` when wiring a real API. */
export const TODAY: ISODate = '2026-10-28';

export function toISO(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromISO(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
}

export function addDays(iso: ISODate, days: number): ISODate {
  const d = fromISO(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function diffDays(a: ISODate, b: ISODate) {
  return Math.round((fromISO(a).getTime() - fromISO(b).getTime()) / 86_400_000);
}

export const monthKey = (iso: ISODate) => iso.slice(0, 7);

export interface DateRange {
  from: ISODate;
  to: ISODate;
}

export type RangePreset = '30d' | '90d' | 'ytd' | '12m' | 'last-year';

export const rangePresets: { value: RangePreset; label: string }[] = [
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'ytd', label: 'Year to date' },
  { value: '12m', label: 'Last 12 months' },
  { value: 'last-year', label: 'Last year' },
];

export function resolveRange(preset: RangePreset, today: ISODate = TODAY): DateRange {
  const year = Number(today.slice(0, 4));
  switch (preset) {
    case '30d':
      return { from: addDays(today, -29), to: today };
    case '90d':
      return { from: addDays(today, -89), to: today };
    case 'ytd':
      return { from: `${year}-01-01`, to: today };
    case '12m': {
      const d = fromISO(today);
      d.setFullYear(d.getFullYear() - 1);
      return { from: addDays(toISO(d), 1), to: today };
    }
    case 'last-year':
      return { from: `${year - 1}-01-01`, to: `${year - 1}-12-31` };
  }
}

/** The period of equal length right before `range` — used for % change. */
export function previousRange(range: DateRange): DateRange {
  const len = diffDays(range.to, range.from) + 1;
  return { from: addDays(range.from, -len), to: addDays(range.from, -1) };
}

export const inRange = (iso: ISODate, r: DateRange) => iso >= r.from && iso <= r.to;

export type Granularity = 'day' | 'week' | 'month';

export function granularityFor(range: DateRange): Granularity {
  const days = diffDays(range.to, range.from) + 1;
  if (days <= 31) return 'day';
  if (days <= 120) return 'week';
  return 'month';
}

/** Monday-based week start. */
export function weekStart(iso: ISODate): ISODate {
  const d = fromISO(iso);
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow);
  return toISO(d);
}

/** Buckets covering a range, in order, for charting. */
export function buckets(range: DateRange, g: Granularity): ISODate[] {
  const out: ISODate[] = [];
  if (g === 'day') {
    for (let d = range.from; d <= range.to; d = addDays(d, 1)) out.push(d);
  } else if (g === 'week') {
    for (let d = weekStart(range.from); d <= range.to; d = addDays(d, 7)) out.push(d);
  } else {
    const d = fromISO(range.from);
    d.setDate(1);
    while (toISO(d) <= range.to) {
      out.push(toISO(d));
      d.setMonth(d.getMonth() + 1);
    }
  }
  return out;
}

export function bucketOf(iso: ISODate, g: Granularity): ISODate {
  if (g === 'day') return iso;
  if (g === 'week') return weekStart(iso);
  return `${monthKey(iso)}-01`;
}
