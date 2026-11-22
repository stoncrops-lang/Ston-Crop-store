/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './dashboard/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/shared/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#070708',
          900: '#0D0D0F',
          850: '#121215',
          800: '#18181C',
          700: '#24242A',
          600: '#32323A',
        },
        burgundy: {
          500: '#8C3742',
          600: '#7B2C37',
          700: '#722F37',
          800: '#581825',
          900: '#3D0D17',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-manrope)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.22em',
      },
    },
  },
  plugins: [],
};
