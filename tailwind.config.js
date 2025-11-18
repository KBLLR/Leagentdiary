/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: {
          light: '#f9fafb',
          DEFAULT: '#0f172a',
        },
        surface: {
          light: '#ffffff',
          DEFAULT: '#1e293b',
          hover: '#2d3748',
        },
        border: {
          light: '#e2e8f0',
          DEFAULT: '#334155',
        },
        text: {
          primary: {
            light: '#111827',
            DEFAULT: '#e5e5e5',
          },
          secondary: {
            light: '#6b7280',
            DEFAULT: '#a1a1a1',
          },
        },
        accent: '#818cf8',
        success: '#4ade80',
        warning: '#fbbf24',
        error: '#f87171',
      },
    },
  },
  plugins: [],
}
