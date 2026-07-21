/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: 'var(--bg-canvas)',
          dark: '#0A0B0D',
          light: '#F8FAFC',
        },
        surface: {
          DEFAULT: 'var(--bg-surface)',
          dark: '#131417',
          light: '#FFFFFF',
          raised: 'var(--bg-surface-raised)',
          'raised-dark': '#1B1D21',
          'raised-light': '#F1F5F9',
        },
        border: {
          subtle: 'var(--border-subtle)',
          'subtle-dark': '#2A2D33',
          'subtle-light': '#E2E8F0',
        },
        accent: {
          primary: '#4C8DFF',
          hover: '#6DA0FF',
        },
        semantic: {
          success: '#33C481',
          warning: '#E8A63C',
          danger: '#EF5A5A',
          info: '#6B8FE8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
