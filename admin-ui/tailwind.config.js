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
        'system': ['-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        glass: {
          50: 'rgba(255, 255, 255, 0.08)',
          100: 'rgba(255, 255, 255, 0.15)',
          200: 'rgba(255, 255, 255, 0.25)',
          300: 'rgba(255, 255, 255, 0.35)',
          400: 'rgba(255, 255, 255, 0.45)',
          500: 'rgba(255, 255, 255, 0.55)',
          dark: {
            50: 'rgba(0, 0, 0, 0.10)',
            100: 'rgba(0, 0, 0, 0.20)',
            200: 'rgba(0, 0, 0, 0.30)',
            300: 'rgba(0, 0, 0, 0.40)',
            400: 'rgba(0, 0, 0, 0.50)',
            500: 'rgba(0, 0, 0, 0.60)',
          }
        },
        agent: {
          logic: '#A855F7',    // Brighter Purple for DeepSeek
          math: '#06B6D4',     // Brighter Cyan for Qwen
          code: '#10B981',     // Brighter Emerald for Llama Coding
          chat: '#64748B',     // Brighter Slate for Simple Chat
        }
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'thinking': 'thinking 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        thinking: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}