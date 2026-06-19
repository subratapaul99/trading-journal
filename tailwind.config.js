/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0A0E1A',
          secondary: '#111827',
          card: '#1C2333',
          hover: '#243044',
        },
        accent: {
          cyan: '#00D4FF',
          green: '#00C896',
          red: '#E84040',
          amber: '#F59E0B',
          blue: '#5882FF',
          purple: '#A855F7',
        },
        text: {
          primary: '#E8EAF0',
          secondary: '#8892A4',
          muted: '#4B5563',
        },
        border: {
          DEFAULT: '#1E2A3A',
          hover: '#2D3E55',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
