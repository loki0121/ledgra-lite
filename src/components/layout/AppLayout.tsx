import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Bell, LogOut, UserRound, Menu, Moon, Search, Settings as SettingsIcon, Sun, X } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Avatar } from '@/components/ui/misc';
import { appConfig } from '@/config/app.config';
import { useSettings } from '@/providers/SettingsProvider';
import { CommandPalette } from './CommandPalette';
import { Sidebar, SidebarContent } from './Sidebar';

const iconBtn =
  'relative inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-line bg-surface text-fg-2 hover:bg-surface-2';

function UserMenu() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
        className="rounded-full"
      >
        <Avatar name={appConfig.user.name} size={44} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div role="menu" className="card absolute right-0 top-[52px] z-50 w-60 p-1.5 shadow-pop">
            <div className="px-3 py-2.5">
              <p className="text-sm font-semibold">{appConfig.user.name}</p>
              <p className="truncate text-xs text-muted">{appConfig.user.email}</p>
            </div>
            <div className="my-1 h-px bg-line" />
            <Link role="menuitem" to="/profile" className="flex min-h-[44px] items-center gap-2.5 rounded-lg px-3 text-sm text-fg-2 hover:bg-surface-2">
              <UserRound className="h-4 w-4" aria-hidden /> Profile
            </Link>
            <Link role="menuitem" to="/settings" className="flex min-h-[44px] items-center gap-2.5 rounded-lg px-3 text-sm text-fg-2 hover:bg-surface-2">
              <SettingsIcon className="h-4 w-4" aria-hidden /> Settings
            </Link>
            <Link role="menuitem" to="/auth/login" className="flex min-h-[44px] items-center gap-2.5 rounded-lg px-3 text-sm text-fg-2 hover:bg-surface-2">
              <LogOut className="h-4 w-4" aria-hidden /> Sign out
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export function AppLayout() {
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  const { resolvedTheme, toggleTheme } = useSettings();
  const location = useLocation();

  useEffect(() => {
    setDrawer(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearch(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2">
        Skip to content
      </a>
      <Sidebar />

      <Dialog open={drawer} onClose={() => setDrawer(false)} label="Navigation" position="left" className="relative h-full w-[min(18rem,85vw)] border-r border-line">
        <button type="button" onClick={() => setDrawer(false)} aria-label="Close navigation" className="absolute right-3 top-6 z-10 inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted hover:bg-surface-2">
          <X className="h-5 w-5" />
        </button>
        <SidebarContent onNavigate={() => setDrawer(false)} />
      </Dialog>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-surface/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
          <button type="button" className={`${iconBtn} lg:hidden`} onClick={() => setDrawer(true)} aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setSearch(true)}
            className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-[10px] border border-line-strong bg-surface-2 px-3.5 text-left text-sm text-muted hover:border-primary/50 sm:max-w-md"
          >
            <Search className="h-4 w-4 shrink-0" aria-hidden />
            <span className="flex-1 truncate">Search pages, customers, invoices…</span>
            <kbd className="hidden rounded-md border border-line bg-surface px-1.5 py-0.5 text-xs sm:inline">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" className={iconBtn} onClick={toggleTheme} aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link to="/notifications" className={`${iconBtn} hidden sm:inline-flex`} aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-[11px] top-[10px] h-2 w-2 rounded-full bg-warning ring-2 ring-surface" />
            </Link>
            <UserMenu />
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </main>
      </div>

      <CommandPalette open={search} onClose={() => setSearch(false)} />
    </div>
  );
}
