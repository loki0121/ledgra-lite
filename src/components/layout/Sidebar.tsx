import { NavLink } from 'react-router-dom';
import { navigation } from '@/config/navigation';
import { appConfig } from '@/config/app.config';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/misc';
import { Logo } from './Logo';

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-7 px-4 py-6">
      <Logo />
      <nav aria-label="Main" className="flex flex-1 flex-col gap-6 overflow-y-auto">
        {navigation.map((section) => (
          <div key={section.title} className="flex flex-col gap-0.5">
            <p className="label-caps mb-1.5 px-3">{section.title}</p>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm transition-colors',
                    isActive ? 'bg-primary/10 font-semibold text-primary-text' : 'font-medium text-fg-2 hover:bg-surface-2 hover:text-fg',
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.8} aria-hidden />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span className="rounded-full bg-surface-2 px-2 text-xs font-semibold text-fg-2 ring-1 ring-line">{item.badge}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="flex items-center gap-3 rounded-xl border border-line p-3">
        <Avatar name={appConfig.user.name} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{appConfig.user.name}</p>
          <p className="truncate text-xs text-muted">{appConfig.user.role}</p>
        </div>
      </div>
    </div>
  );
}

/** Fixed sidebar for ≥1024px. On smaller screens the same content opens in a drawer (see AppLayout). */
export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-surface lg:block">
      <SidebarContent />
    </aside>
  );
}
