/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Instrument Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: token('bg'),
        surface: { DEFAULT: token('surface'), 2: token('surface-2') },
        line: { DEFAULT: token('border'), strong: token('border-strong') },
        fg: { DEFAULT: token('fg'), 2: token('fg-2') },
        muted: token('muted'),
        primary: { DEFAULT: token('primary'), fg: token('primary-fg'), text: token('primary-text') },
        warning: { DEFAULT: token('warning'), soft: token('warning-soft') },
        danger: { DEFAULT: token('danger'), soft: token('danger-soft') },
      },
      borderColor: { DEFAULT: token('border') },
      borderRadius: { xl: '0.875rem' },
      boxShadow: {
        card: '0 1px 2px rgb(16 24 40 / 0.04)',
        pop: '0 12px 32px -8px rgb(16 24 40 / 0.18), 0 2px 6px rgb(16 24 40 / 0.06)',
      },
    },
  },
  plugins: [],
};
