import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { cn, initials } from '@/lib/utils';

export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {breadcrumb && <div className="mb-2 text-sm text-muted">{breadcrumb}</div>}
        <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  badge,
  footnote,
  icon: Icon,
}: {
  label: string;
  value: ReactNode;
  badge?: ReactNode;
  footnote?: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="card flex flex-col gap-2.5 p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-[13px] font-medium text-muted">
          {Icon && <Icon className="h-4 w-4" aria-hidden />}
          {label}
        </span>
        {badge}
      </div>
      <div className="truncate text-[26px] font-bold tracking-tight sm:text-[28px]">{value}</div>
      {footnote && <div className="text-xs text-muted">{footnote}</div>}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted ring-1 ring-line">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Avatar({ name, size = 36, className }: { name: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full bg-fg font-semibold text-surface', className)}
    >
      {initials(name)}
    </span>
  );
}

/** Segmented filter (tabs-like). Uses aria-pressed buttons. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
  label: string;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={cn('flex flex-wrap gap-1 rounded-xl bg-surface-2 p-1 ring-1 ring-inset ring-line', className)}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-colors',
              on ? 'bg-surface font-semibold text-fg shadow-card ring-1 ring-line' : 'font-medium text-muted hover:text-fg',
            )}
          >
            {o.label}
            {o.count != null && (
              <span
                className={cn(
                  'rounded-full px-1.5 text-xs font-semibold',
                  on ? 'bg-primary text-primary-fg' : 'bg-line text-fg-2',
                )}
              >
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
