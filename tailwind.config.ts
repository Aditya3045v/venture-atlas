import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        surface: {
          DEFAULT: 'var(--surface)',
          muted: 'var(--surface-muted)',
          card: 'var(--surface-card)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
        },
        border: 'var(--border)',
        brand: {
          DEFAULT: 'var(--brand)',
          strong: 'var(--brand-strong)',
          muted: 'var(--brand-muted)',
        },
        status: {
          success: 'var(--success)',
          warning: 'var(--warning)',
          danger: 'var(--danger)',
          info: 'var(--info)',
        },
        // Venture Atlas Intelligence Design Tokens
        atlas: {
          ink: '#0B0E14',
          mist: '#E6E8EC',
          brass: '#D9A441',
          teal: '#2FA8A0',
          brick: '#C24B3F',
          graphite: '#2A2F3A',
        },
      },
      fontFamily: {
        display: ['"Outfit"', 'var(--font-display)', 'sans-serif'],
        sans: ['"Inter"', 'var(--font-sans)', 'sans-serif'],
        fraunces: ['var(--font-fraunces)', 'Georgia', 'serif'],
        body: ['var(--font-sans)', '"Inter"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'var(--font-mono)', '"JetBrains Mono"', '"Space Mono"', 'monospace'],
        plex: ['var(--font-plex-mono)', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.08)',
        'editorial': '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
