import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { appConfig, currencies, type ThemeMode } from '@/config/app.config';
import { hexToRgb, isHexColor, mix, rgbToHex } from '@/lib/utils';

export interface Settings {
  brandName: string;
  primary: string;
  currency: string;
  theme: ThemeMode;
}

interface ChartColors {
  primary: string;
  primarySoft: string;
  expense: string;
  grid: string;
  axis: string;
  /** Categorical palette for donut / stacked charts (lightness-separated). */
  palette: string[];
}

interface SettingsContextValue {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
  resolvedTheme: 'light' | 'dark';
  toggleTheme: () => void;
  chart: ChartColors;
  locale: string;
}

const defaults: Settings = {
  brandName: appConfig.name,
  primary: appConfig.defaults.primary,
  currency: appConfig.defaults.currency,
  theme: appConfig.defaults.theme,
};

function load(): Settings {
  try {
    const raw = localStorage.getItem(appConfig.storageKey);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      ...defaults,
      ...parsed,
      primary: parsed.primary && isHexColor(parsed.primary) ? parsed.primary : defaults.primary,
    };
  } catch {
    return defaults;
  }
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function systemPrefersDark() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load);
  const [systemDark, setSystemDark] = useState<boolean>(systemPrefersDark);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme: 'light' | 'dark' =
    settings.theme === 'system' ? (systemDark ? 'dark' : 'light') : settings.theme;

  // Apply theme class + primary color tokens to <html>.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedTheme === 'dark');
    const rgb = hexToRgb(settings.primary);
    const text = resolvedTheme === 'dark' ? mix(rgb, [255, 255, 255], 0.45) : mix(rgb, [0, 0, 0], 0.15);
    root.style.setProperty('--primary', rgb.join(' '));
    root.style.setProperty('--primary-text', text.map(Math.round).join(' '));
  }, [settings.primary, resolvedTheme]);

  useEffect(() => {
    try {
      localStorage.setItem(appConfig.storageKey, JSON.stringify(settings));
    } catch {
      /* storage unavailable (private mode) — settings still work for this session */
    }
  }, [settings]);

  useEffect(() => {
    document.title = `${settings.brandName} — Admin Dashboard`;
  }, [settings.brandName]);

  const update = useCallback((patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })), []);
  const reset = useCallback(() => setSettings(defaults), []);
  const toggleTheme = useCallback(
    () => setSettings((s) => ({ ...s, theme: resolvedTheme === 'dark' ? 'light' : 'dark' })),
    [resolvedTheme],
  );

  const chart = useMemo<ChartColors>(() => {
    const rgb = hexToRgb(settings.primary);
    const dark = resolvedTheme === 'dark';
    const bg: [number, number, number] = dark ? [19, 22, 30] : [255, 255, 255];
    return {
      primary: settings.primary,
      primarySoft: rgbToHex(mix(rgb, bg, 0.55)),
      expense: '#F5A66B',
      grid: dark ? '#262B38' : '#EEF0F3',
      axis: dark ? '#98A0B0' : '#5D6679',
      palette: [settings.primary, rgbToHex(mix(rgb, bg, 0.55)), '#C2410C', '#F5A66B', dark ? '#4B5263' : '#C4CAD4'],
    };
  }, [settings.primary, resolvedTheme]);

  const locale = currencies.find((c) => c.code === settings.currency)?.locale ?? 'en-US';

  const value = useMemo(
    () => ({ settings, update, reset, resolvedTheme, toggleTheme, chart, locale }),
    [settings, update, reset, resolvedTheme, toggleTheme, chart, locale],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}
