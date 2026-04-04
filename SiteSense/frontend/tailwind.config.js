/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'site-bg': '#0f172a',
        'site-panel': '#1e293b',
        'site-accent': '#38bdf8',
      },
    },
  },
  plugins: [],
}