/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Hind Siliguri"', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        bkash: {
          DEFAULT: '#E2136E',
          soft: '#FDF2F7',
          dark: '#B80E58',
        },
        nagad: {
          DEFAULT: '#EA4325',
          soft: '#FEF3F0',
          dark: '#C53318',
        },
        islamic: {
          DEFAULT: '#0B7A53',
          soft: '#ECFDF5',
          dark: '#085E40',
        },
        rocket: {
          DEFAULT: '#8C3494',
          soft: '#FAF2FB',
        },
        npsb: {
          DEFAULT: '#0F766E',
          soft: '#F0FDFA',
        },
      },
      boxShadow: {
        soft: '0 2px 12px -2px rgba(15, 23, 42, 0.06), 0 1px 4px -1px rgba(15, 23, 42, 0.04)',
        card: '0 8px 28px -6px rgba(15, 23, 42, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
};
