import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { appConfig } from '@/config/app.config';
import { cashflowSeries, financeSummary, receivables } from '@/data/selectors';
import { useData } from '@/providers/DataProvider';
import { useSettings } from '@/providers/SettingsProvider';
import { resolveRange } from '@/lib/date';
import { change, useFormat } from '@/lib/format';
import { Logo } from './Logo';

const highlights = [
  'Invoices, payments and cash flow in one place',
  'Pipeline, customers and reports that always agree',
  'Light and dark themes, ready for your brand',
];

/**
 * The right-hand panel previews the real dashboard data so the sign-in page
 * shows what the product does. Edit `highlights` and the headline to suit
 * your product.
 */
function ProductPreview() {
  const { transactions, invoices } = useData();
  const f = useFormat();
  const range = useMemo(() => resolveRange('ytd'), []);
  const { current, previous } = useMemo(() => financeSummary(transactions, range), [transactions, range]);
  const series = useMemo(() => cashflowSeries(transactions, range).points, [transactions, range]);
  const ar = useMemo(() => receivables(invoices), [invoices]);
  const max = Math.max(...series.map((p) => p.revenue), 1);
  const delta = previous ? change(current.revenue, previous.revenue) : null;

  return (
    <div aria-hidden className="w-full max-w-[460px] rounded-2xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur-sm">
      <div className="flex items-center justify-between text-xs font-medium text-white/75">
        <span>Revenue · Year to date</span>
        {delta != null && <span className="rounded-full bg-white/15 px-2 py-0.5 font-semibold text-white">{f.percent(delta)}</span>}
      </div>
      <p className="mt-1 text-3xl font-bold tracking-tight text-white">{f.moneyShort(current.revenue)}</p>
      <div className="mt-5 flex h-24 items-end gap-1.5">
        {series.map((p) => (
          <div key={p.key} className="flex-1 rounded-t bg-white/80" style={{ height: `${Math.max(6, (p.revenue / max) * 100)}%` }} />
        ))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/10 p-3">
          <p className="text-xs text-white/70">Net profit</p>
          <p className="text-lg font-bold text-white">{f.moneyShort(current.profit)}</p>
        </div>
        <div className="rounded-xl bg-white/10 p-3">
          <p className="text-xs text-white/70">Outstanding</p>
          <p className="text-lg font-bold text-white">{f.moneyShort(ar.amount)}</p>
        </div>
      </div>
    </div>
  );
}

export function AuthLayout() {
  const { settings } = useSettings();
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[420px]">
            <Outlet />
          </div>
        </div>
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} {settings.brandName}. All rights reserved.
        </p>
      </div>

      <aside className="relative hidden overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-center lg:gap-10 lg:p-14 xl:p-20">
        <div aria-hidden className="absolute -right-28 -top-28 h-[420px] w-[420px] rounded-full border-[56px] border-white/10" />
        <div className="relative max-w-[460px] text-primary-fg">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] opacity-80">{appConfig.tagline}</p>
          <h2 className="mt-4 text-[34px] font-bold leading-tight tracking-tight">Run your finances from one calm workspace.</h2>
          <ul className="mt-6 flex flex-col gap-3 text-[15px]">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 opacity-95">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                {h}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <ProductPreview />
        </div>
      </aside>
    </div>
  );
}
