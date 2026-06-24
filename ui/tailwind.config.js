/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2563eb', // Blue-600
          emergency: '#dc2626', // Red-600
        },
      },
    },
  },
  plugins: [],
}