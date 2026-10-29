import { Link } from 'react-router-dom';
import { appConfig } from '@/config/app.config';
import { useSettings } from '@/providers/SettingsProvider';

export function Logo({ to = '/' }: { to?: string }) {
  const { settings } = useSettings();
  return (
    <Link to={to} className="flex items-center gap-2.5 rounded-lg px-2 py-1" aria-label={`${settings.brandName} home`}>
      {appConfig.logo.src ? (
        <img src={appConfig.logo.src} alt="" className="h-8 w-8 rounded-lg object-contain" />
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-fg">
          {(settings.brandName[0] ?? appConfig.logo.mark).toUpperCase()}
        </span>
      )}
      <span className="truncate text-[19px] font-bold tracking-tight">{settings.brandName}</span>
    </Link>
  );
}
