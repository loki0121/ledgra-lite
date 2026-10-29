import { useState } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import { authProviders, type AuthProvider } from '@/config/auth';
import { cn } from '@/lib/utils';

/**
 * Social sign-in buttons. `onSelect` receives the provider id — wire it to
 * your auth library (Auth.js, Clerk, Supabase, Firebase, Auth0…).
 */
export function SocialButtons({
  action = 'Continue',
  onSelect,
}: {
  action?: string;
  onSelect: (provider: AuthProvider['id']) => Promise<void> | void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const providers = authProviders.filter((p) => p.enabled);
  if (!providers.length) return null;

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {providers.map((p) => (
        <button
          key={p.id}
          type="button"
          disabled={busy !== null}
          aria-label={`${action} with ${p.label}`}
          onClick={async () => {
            setBusy(p.id);
            try {
              await onSelect(p.id);
            } finally {
              setBusy(null);
            }
          }}
          className={cn(
            'flex h-11 items-center justify-center gap-2.5 rounded-[10px] border border-line-strong bg-surface px-3 text-sm font-semibold text-fg-2 transition-colors',
            'hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60',
          )}
        >
          {busy === p.id ? (
            <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden />
          ) : p.icon ? (
            <img
              src={p.icon}
              alt=""
              className="h-[18px] w-[18px]"
              onError={(e) => {
                // Missing file: hide the broken image instead of showing an empty box.
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <KeyRound className="h-[18px] w-[18px] text-muted" aria-hidden />
          )}
          {p.label}
        </button>
      ))}
    </div>
  );
}

export function OrDivider({ label = 'or continue with email' }: { label?: string }) {
  return (
    <div className="my-6 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.08em] text-muted">
      <span className="h-px flex-1 bg-line" />
      {label}
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
