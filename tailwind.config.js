/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
        },
      },
    },
  },
  plugins: [],
}

