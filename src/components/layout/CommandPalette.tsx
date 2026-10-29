import { useMemo, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CornerDownLeft, FileText, Search, Users, type LucideIcon } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { navigation } from '@/config/navigation';
import { customers } from '@/data/customers';
import { invoiceTotals } from '@/data/generate';
import { useData } from '@/providers/DataProvider';
import { useFormat } from '@/lib/format';
import { cn } from '@/lib/utils';

interface Result {
  id: string;
  group: 'Pages' | 'Customers' | 'Invoices';
  title: string;
  subtitle?: string;
  to: string;
  icon: LucideIcon;
  haystack: string;
}

/** ⌘K / Ctrl+K search across pages, customers and invoices. */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { invoices } = useData();
  const f = useFormat();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const index = useMemo<Result[]>(() => {
    const pages: Result[] = navigation.flatMap((s) =>
      s.items.map((i) => ({
        id: `p-${i.to}`,
        group: 'Pages' as const,
        title: i.label,
        subtitle: s.title,
        to: i.to,
        icon: i.icon,
        haystack: `${i.label} ${s.title} ${i.keywords ?? ''}`.toLowerCase(),
      })),
    );
    const people: Result[] = customers.map((c) => ({
      id: `c-${c.id}`,
      group: 'Customers',
      title: c.company,
      subtitle: `${c.contact} · ${c.country}`,
      to: `/crm/customers?q=${encodeURIComponent(c.company)}`,
      icon: Users,
      haystack: `${c.company} ${c.contact} ${c.email} ${c.country}`.toLowerCase(),
    }));
    const names = new Map(customers.map((c) => [c.id, c.company]));
    const invs: Result[] = invoices.map((inv) => ({
      id: `i-${inv.id}`,
      group: 'Invoices',
      title: inv.number,
      subtitle: `${names.get(inv.customerId) ?? ''} · ${f.money(invoiceTotals(inv).total)} · ${inv.status}`,
      to: `/invoices/${inv.id}`,
      icon: FileText,
      haystack: `${inv.number} ${names.get(inv.customerId) ?? ''} ${inv.status}`.toLowerCase(),
    }));
    return [...pages, ...people, ...invs];
  }, [invoices, f]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.filter((r) => r.group === 'Pages');
    const terms = q.split(/\s+/);
    const matches = index.filter((r) => terms.every((t) => r.haystack.includes(t)));
    // Cap each group so one type doesn't flood the list.
    const capped: Result[] = [];
    (['Pages', 'Customers', 'Invoices'] as const).forEach((g) => capped.push(...matches.filter((m) => m.group === g).slice(0, 6)));
    return capped;
  }, [index, query]);

  const close = () => {
    onClose();
    setQuery('');
    setActive(0);
  };

  const go = (r: Result | undefined) => {
    if (!r) return;
    navigate(r.to);
    close();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[active]);
    }
  };

  let lastGroup = '';

  return (
    <Dialog open={open} onClose={close} label="Search" position="top" className="w-full max-w-xl overflow-hidden rounded-2xl border border-line">
      <div className="flex items-center gap-3 border-b border-line px-4">
        <Search className="h-5 w-5 text-muted" aria-hidden />
        <input
          data-autofocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search pages, customers, invoices…"
          aria-label="Search"
          role="combobox"
          aria-expanded="true"
          aria-controls="command-results"
          aria-activedescendant={results[active] ? `cmd-${results[active]!.id}` : undefined}
          className="h-14 flex-1 bg-transparent text-[15px] placeholder:text-muted focus:outline-none"
        />
        <kbd className="rounded-md border border-line px-1.5 py-0.5 text-xs text-muted">Esc</kbd>
      </div>
      <ul id="command-results" role="listbox" aria-label="Results" className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
        {results.length === 0 && <li className="px-3 py-10 text-center text-sm text-muted">No matches for “{query}”.</li>}
        {results.map((r, i) => {
          const header = r.group !== lastGroup ? r.group : null;
          lastGroup = r.group;
          return (
            <li key={r.id} role="presentation">
              {header && <p className="label-caps px-3 pb-1 pt-3">{header}</p>}
              <div
                id={`cmd-${r.id}`}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(r)}
                className={cn(
                  'flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg px-3 py-2',
                  i === active ? 'bg-primary/10 text-primary-text' : 'text-fg-2',
                )}
              >
                <r.icon className="h-4 w-4 shrink-0" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{r.title}</p>
                  {r.subtitle && <p className="truncate text-xs text-muted">{r.subtitle}</p>}
                </div>
                {i === active && <CornerDownLeft className="h-4 w-4" aria-hidden />}
              </div>
            </li>
          );
        })}
      </ul>
    </Dialog>
  );
}
