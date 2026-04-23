/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      animation: {
        pulse: 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      colors: {
        brand: {
          primary: '#2254c5',
          accent: '#2254c5', // Kept for semantics if needed
          navy: '#041E42',
          bg: '#F5F6F8',
        }
      },
      fontFamily: {
        poppins: ['"Poppins"', 'sans-serif'],
        merriweather: ['"Merriweather"', 'serif'],
      }
    },
  },
  plugins: [],
}
