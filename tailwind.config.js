/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
       colors: {
      primary: '#E2592D',
      secondary: '#27403B',
      lightBg: '#FFF6F2',
      peach: '#FDE3DA',
      darkGreen: '#1B2C29',
      gold: '#F4A261',
      textDark: '#1A1A1A',
      textLight: '#555555',
      border: '#E5E5E5',
    }
    },
  },
  plugins: [],
}