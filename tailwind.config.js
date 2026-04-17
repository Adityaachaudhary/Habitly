/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'DM Sans', 'sans-serif'],
      },
      colors: {
        primary: {
          50: 'rgb(var(--primary-50-rgb) / <alpha-value>)',
          100: 'rgb(var(--primary-100-rgb) / <alpha-value>)',
          200: 'rgb(var(--primary-200-rgb) / <alpha-value>)',
          300: 'rgb(var(--primary-300-rgb) / <alpha-value>)',
          400: 'rgb(var(--primary-400-rgb) / <alpha-value>)',
          500: 'rgb(var(--primary-500-rgb) / <alpha-value>)',
          600: 'rgb(var(--primary-600-rgb) / <alpha-value>)',
          700: 'rgb(var(--primary-700-rgb) / <alpha-value>)',
          800: 'rgb(var(--primary-800-rgb) / <alpha-value>)',
          900: 'rgb(var(--primary-900-rgb) / <alpha-value>)',
        },
        accent: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
        },
        surface: '#FAFAF8',
      },
      boxShadow: {
        soft: '0 2px 20px rgba(0,0,0,0.06)',
        card: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
        hover: '0 4px 24px rgba(0,0,0,0.10)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'check': 'checkAnim 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        bounceIn: { from: { opacity: '0', transform: 'scale(0.8)' }, to: { opacity: '1', transform: 'scale(1)' } },
        checkAnim: { from: { transform: 'scale(0)' }, to: { transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}
