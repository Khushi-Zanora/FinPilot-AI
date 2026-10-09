/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        dark: {
          950: '#05080E',
          900: '#080D16',
          850: '#0D1422',
          800: '#121B2B',
          700: '#1E293B',
          600: '#334155'
        },
        mint: {
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          DEFAULT: '#05DF85',
          600: '#059669',
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          900: '#064e3b'
        }
      },
      boxShadow: {
        'glow-emerald': '0 0 50px -10px rgba(16, 185, 129, 0.25)',
        'glow-mint': '0 0 40px -8px rgba(5, 223, 133, 0.3)',
        'glow-sm': '0 0 20px -5px rgba(16, 185, 129, 0.2)',
      }
    },
  },
  plugins: [],
}
