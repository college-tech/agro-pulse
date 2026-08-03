import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#ecfdf5',
          100: '#d1fae5',
          300: '#6ee7b7',
          500: '#10b981', // Main Green
          700: '#047857',
          900: '#064e3b', // Deep Green
          950: '#022c22', // Darkest Green
        }
      },
      backgroundImage: {
        'hero-pattern': "url('https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2664&auto=format&fit=crop')",
      }
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
  ]
})
