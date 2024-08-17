// tailwind.config.js
import typography from '@tailwindcss/typography';

export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rocket: '#FBBF24', // Rocket yellow
        space: '#1F2937', // Space gray
        flame: '#EF4444', // Flame red
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [
    typography,
  ],
};
