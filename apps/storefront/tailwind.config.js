/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/shared/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF8F5',
          200: '#F3EFEA',
          300: '#E8E2D8',
          400: '#D6CDBF',
        },
        obsidian: {
          950: '#080809',
          900: '#0E0E10',
          800: '#161619',
          700: '#222226',
          600: '#2E2E34',
        },
        burgundy: {
          50: '#FBF2F3',
          100: '#F5DEE1',
          500: '#8C3742',
          600: '#7B2C37',
          700: '#722F37', // signature embroidery color
          800: '#581825',
          900: '#3D0D17',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-manrope)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ['var(--font-manrope)', 'var(--font-inter)', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.22em',
        ultra: '0.35em',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
