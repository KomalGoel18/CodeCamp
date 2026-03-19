/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        emerald: {
          950: '#022c22',
           glow: 'rgba(16, 185, 129, 0.15)',
        },
      },
      boxShadow: {
        'glow': '0 0 40px rgba(16, 185, 129, 0.1)',
        'glow-lg': '0 0 60px rgba(16, 185, 129, 0.15)',
      },
    },
  },
  plugins: [],
};
