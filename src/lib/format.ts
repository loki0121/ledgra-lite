import { useMemo } from 'react';
import { useSettings } from '@/providers/SettingsProvider';
import { fromISO, type ISODate } from './date';

/**
 * Locale/currency-aware formatters. Amounts in the data layer are stored in
 * a single base unit; the currency setting changes how they are displayed.
 */
export function useFormat() {
  const { settings, locale } = useSettings();
  return useMemo(() => {
    const noDecimals = settings.currency === 'JPY' || settings.currency === 'MNT';
    const money = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: settings.currency,
      maximumFractionDigits: noDecimals ? 0 : 2,
      minimumFractionDigits: noDecimals ? 0 : 2,
    });
    const moneyShort = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: settings.currency,
      maximumFractionDigits: 0,
    });
    const compact = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: settings.currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    });
    const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
    const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'short' });
    const monthYear = new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' });
    return {
      /** $12,480.00 */
      money: (n: number) => money.format(n),
      /** $12,480 */
      moneyShort: (n: number) => moneyShort.format(n),
      /** $12.5K */
      compact: (n: number) => compact.format(n),
      percent: (n: number, digits = 1) => `${n > 0 ? '+' : ''}${n.toFixed(digits)}%`,
      date: (iso: ISODate) => dateFmt.format(fromISO(iso)),
      shortDate: (iso: ISODate) => shortDate.format(fromISO(iso)),
      month: (iso: ISODate) => monthFmt.format(fromISO(iso)),
      monthYear: (iso: ISODate) => monthYear.format(fromISO(iso)),
    };
  }, [settings.currency, locale]);
}

export type Formatters = ReturnType<typeof useFormat>;

/** % change, or null when there is no baseline to compare against. */
export function change(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}
