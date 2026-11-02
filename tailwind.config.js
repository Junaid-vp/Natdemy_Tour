/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        tour: {
          bg: '#080808',
          card: 'rgba(18, 18, 22, 0.72)',
          border: 'rgba(255, 255, 255, 0.1)',
          accent: '#3b82f6',
        }
      }
    },
  },
  plugins: [],
}
