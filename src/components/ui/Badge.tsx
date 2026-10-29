import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { InvoiceStatus, Transaction } from '@/data/types';

type Tone = 'primary' | 'warning' | 'danger' | 'neutral' | 'strong';

const tones: Record<Tone, string> = {
  primary: 'bg-primary/10 text-primary-text',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  neutral: 'bg-surface-2 text-fg-2 ring-1 ring-inset ring-line',
  strong: 'bg-fg text-surface',
};

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold', tones[tone], className)}>
      {children}
    </span>
  );
}

const invoiceTone: Record<InvoiceStatus, Tone> = {
  paid: 'primary',
  pending: 'warning',
  overdue: 'strong',
  draft: 'neutral',
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <Badge tone={invoiceTone[status]}>{status[0]!.toUpperCase() + status.slice(1)}</Badge>;
}

export function TxStatusBadge({ status }: { status: Transaction['status'] }) {
  return <Badge tone={status === 'completed' ? 'primary' : 'warning'}>{status === 'completed' ? 'Completed' : 'Pending'}</Badge>;
}

/** Small +/- pill for KPI deltas. `invert` for metrics where up is bad (expenses). */
export function DeltaBadge({ value, invert = false }: { value: number | null; invert?: boolean }) {
  if (value == null || !Number.isFinite(value)) return <Badge tone="neutral">No baseline</Badge>;
  const good = invert ? value <= 0 : value >= 0;
  return (
    <Badge tone={good ? 'primary' : 'warning'}>
      {value > 0 ? '+' : ''}
      {value.toFixed(1)}%
    </Badge>
  );
}
