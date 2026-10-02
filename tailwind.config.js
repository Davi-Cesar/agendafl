/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/renderer/**/*.{html,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#16130b',
        surface: {
          DEFAULT: '#16130b',
          dim: '#16130b',
          bright: '#3d392f',
          lowest: '#110e06',
          low: '#1f1b13',
          container: '#231f16',
          high: '#2d2a20',
          highest: '#38342b',
        },
        primary: {
          DEFAULT: '#e9c340',
          dark: '#b8960c',
          container: '#b8960c',
        },
        on: {
          surface: '#eae2d3',
          variant: '#d0c6af',
          primary: '#3c2f00',
        },
        outline: {
          DEFAULT: '#99907b',
          variant: '#4d4635',
          dark: '#1e1e1e',
        },
        secondary: '#c8c6c5',
        tertiary: '#b8c4ff',
        error: {
          DEFAULT: '#ffb4ab',
          container: '#93000a',
        },
        border: {
          DEFAULT: '#38342b',
        },
      },
      boxShadow: {
        sidebar: '4px 0 20px rgba(233, 195, 64, 0.12)',
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        sm: '0.25rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
      },
    },
  },
  plugins: [],
};
