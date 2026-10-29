import { useLocation } from 'react-router-dom';
import { ArrowLeft, Check, ExternalLink, Lock } from 'lucide-react';
import { ButtonLink, buttonClasses } from '@/components/ui/Button';
import { navigation } from '@/config/navigation';
import { PRO_DEMO_URL, PRO_URL } from '@/config/lite';

const proIncludes = [
  '27 screens, including 5 dashboards (Finance, Sales, E-commerce, SaaS, Projects)',
  'Invoice detail and invoice builder with validation',
  'CRM pipeline, customers, reports and P&L statement',
  'Inventory, purchase orders, employees and payroll',
  'Task board, calendar, notifications, profile and pricing pages',
  'Full documentation and email support',
];

/** Shown for every screen that ships only in Ledgra Pro. */
export default function ProFeature() {
  const { pathname } = useLocation();
  const item = navigation.flatMap((s) => s.items).find((i) => i.to !== '/' && pathname.startsWith(i.to));
  const name =
    pathname === '/invoices/new' ? 'The invoice builder'
    : pathname.startsWith('/invoices/') ? 'Invoice details'
    : item?.label ?? 'This screen';

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center py-10">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary-text">
        <Lock className="h-6 w-6" aria-hidden />
      </span>
      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.12em] text-primary-text">Ledgra Pro</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{name} is part of Ledgra Pro</h1>
      <p className="mt-3 text-muted">
        Ledgra Lite includes the Finance dashboard, Transactions, Invoices, Settings and the auth pages. Pro adds:
      </p>
      <ul className="mt-6 flex flex-col gap-3 text-sm">
        {proIncludes.map((t) => (
          <li key={t} className="flex items-start gap-3">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-text" aria-hidden />
            {t}
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href={PRO_URL} target="_blank" rel="noreferrer" className={buttonClasses('primary')}>
          Get Ledgra Pro <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
        <a href={PRO_DEMO_URL} target="_blank" rel="noreferrer" className={buttonClasses('secondary')}>
          See the Pro demo
        </a>
        <ButtonLink to="/" variant="ghost">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to dashboard
        </ButtonLink>
      </div>
    </div>
  );
}
