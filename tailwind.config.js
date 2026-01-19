/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'joy-pink': '#E91E63',
        'joy-pink-dark': '#C2185B',
        'joy-pink-light': '#F8BBD0',
      },
    },
  },
  plugins: [],
}
