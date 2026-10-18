/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: token('canvas'),
        surface: token('surface'),
        surface2: token('surface-2'),
        line: token('line'),
        ink: token('ink'),
        muted: token('muted'),
        subtle: token('subtle'),
        primary: token('primary'),
        'primary-hover': token('primary-hover'),
        'on-primary': token('on-primary'),
        accent: token('accent'),
        'accent-soft': token('accent-soft'),
        brand: token('brand'),
        star: token('star'),
        warn: token('warn'),
        'warn-soft': token('warn-soft'),
        danger: token('danger'),
        'danger-soft': token('danger-soft'),
        info: token('info'),
        'info-soft': token('info-soft'),
        forest: {
          DEFAULT: '#123F36',
          900: '#0B2A24',
          800: '#123F36',
          700: '#1A5246',
          600: '#2A6B5B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Bricolage Grotesque"', 'Inter', 'system-ui', 'sans-serif'],
        sign: ['"Bricolage Grotesque"', 'Impact', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(16 24 22 / 0.04), 0 1px 3px rgb(16 24 22 / 0.06)',
        lift: '0 8px 24px -8px rgb(16 24 22 / 0.14), 0 2px 6px rgb(16 24 22 / 0.05)',
        pop: '0 20px 48px -12px rgb(16 24 22 / 0.28)',
        board: '0 1px 0 rgb(0 0 0 / 0.08), 0 10px 18px -8px rgb(16 24 22 / 0.35), 0 2px 4px rgb(16 24 22 / 0.12)',
      },
      maxWidth: {
        content: '76rem',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'slide-up': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        hang: {
          '0%': { opacity: 0, transform: 'translateY(-18px) rotate(calc(var(--r) * -2.5))' },
          '60%': { opacity: 1, transform: 'translateY(2px) rotate(calc(var(--r) * 1.3))' },
          '100%': { opacity: 1, transform: 'translateY(0) rotate(var(--r))' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        rise: {
          from: { opacity: 0, transform: 'translateY(14px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        // Opacity only: a transform here would trap position:fixed children
        // (like the profile's bottom action bar) inside the page while it runs.
        'page-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        'word-up': {
          from: { transform: 'translateY(105%)' },
          to: { transform: 'translateY(0)' },
        },
        'heart-pop': {
          '0%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.35)' },
          '60%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        burst: {
          from: { opacity: 0.6, transform: 'scale(0.4)' },
          to: { opacity: 0, transform: 'scale(1.9)' },
        },
        pop: {
          '0%': { transform: 'scale(0.6)', opacity: 0 },
          '70%': { transform: 'scale(1.12)', opacity: 1 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        draw: {
          from: { strokeDashoffset: 'var(--len, 60)' },
          to: { strokeDashoffset: 0 },
        },
        'bubble-in': {
          from: { opacity: 0, transform: 'translateY(8px) scale(0.96)' },
          to: { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'slide-up': 'slide-up 200ms ease-out',
        'slide-in-right': 'slide-in-right 220ms ease-out',
        'slide-in-left': 'slide-in-left 220ms ease-out',
        hang: 'hang 700ms cubic-bezier(0.3, 0.7, 0.4, 1) backwards',
        rise: 'rise 480ms cubic-bezier(0.2, 0.7, 0.3, 1) backwards',
        'page-in': 'page-in 260ms ease-out',
        'word-up': 'word-up 650ms cubic-bezier(0.2, 0.8, 0.2, 1) backwards',
        'heart-pop': 'heart-pop 450ms cubic-bezier(0.3, 0.7, 0.4, 1)',
        burst: 'burst 550ms ease-out forwards',
        pop: 'pop 380ms cubic-bezier(0.3, 0.7, 0.4, 1) backwards',
        draw: 'draw 450ms ease-out backwards',
        'bubble-in': 'bubble-in 240ms cubic-bezier(0.2, 0.7, 0.3, 1)',
        shimmer: 'shimmer 1.4s infinite',
      },
    },
  },
  plugins: [],
};
