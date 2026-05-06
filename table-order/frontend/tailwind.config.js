/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        danger: '#DC2626',
        success: '#16A34A',
        warning: '#D97706',
        pending: '#6B7280',
      },
    },
  },
  plugins: [],
};
