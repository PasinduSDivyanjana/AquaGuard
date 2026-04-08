/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aqua: {
          DEFAULT: '#00f7ff',
          light: '#5cffff',
          dark: '#00a3a8',
        },
        dark: {
          bg: '#0b0f19',
          card: '#151b2b',
          border: '#1f2937',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
