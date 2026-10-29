/**
 * Ledgra — global app configuration.
 *
 * Change your brand here. Everything below is also editable at runtime
 * from Settings → Branding (saved to localStorage), but these values are
 * the defaults every new visitor sees.
 */
export type ThemeMode = 'light' | 'dark' | 'system';

export interface CurrencyOption {
  code: string;
  label: string;
  locale: string;
}

export const currencies: CurrencyOption[] = [
  { code: 'USD', label: 'US Dollar ($)', locale: 'en-US' },
  { code: 'EUR', label: 'Euro (€)', locale: 'de-DE' },
  { code: 'GBP', label: 'British Pound (£)', locale: 'en-GB' },
  { code: 'JPY', label: 'Japanese Yen (¥)', locale: 'ja-JP' },
  { code: 'MNT', label: 'Mongolian Tögrög (₮)', locale: 'mn-MN' },
  { code: 'INR', label: 'Indian Rupee (₹)', locale: 'en-IN' },
];

export const primaryPresets = ['#2F4BE0', '#0F766E', '#6D28D9', '#C2410C', '#BE185D', '#0E7490'];

export const appConfig = {
  /** Product name shown in the sidebar, page titles and auth screens. */
  name: 'Ledgra',
  tagline: 'Finance, ERP & CRM workspace',
  /**
   * Logo. Set `src` to an image in /public (e.g. '/logo.svg') to replace the
   * lettermark. Leave it null to use `mark` on the primary color.
   */
  logo: {
    src: null as string | null,
    mark: 'L',
  },
  defaults: {
    theme: 'light' as ThemeMode,
    primary: '#2F4BE0',
    currency: 'USD',
  },
  /** localStorage key for user preferences. */
  storageKey: 'ledgra.settings',
  /** Demo user shown in the sidebar and top bar. */
  user: {
    name: 'Ariana Moss',
    role: 'Finance lead',
    email: 'ariana@ledgra.example',
  },
};
