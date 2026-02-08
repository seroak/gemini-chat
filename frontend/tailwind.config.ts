import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Anti-Gravity Dark Theme Palette
        background: {
          DEFAULT: '#0f172a', // Slate 900
          lighter: '#1e293b', // Slate 800
          darker: '#020617', // Slate 950
        },
        primary: {
          DEFAULT: '#6366f1', // Indigo 500
          hover: '#4f46e5', // Indigo 600
          light: '#818cf8', // Indigo 400
        },
        accent: {
          purple: '#a855f7', // Purple 500
          pink: '#ec4899', // Pink 500
          cyan: '#06b6d4', // Cyan 500
        },
        surface: {
          glass: 'rgba(30, 41, 59, 0.7)',
          glassHover: 'rgba(30, 41, 59, 0.8)',
          glassBorder: 'rgba(255, 255, 255, 0.08)',
        },
      },
      animation: {
        blob: 'blob 7s infinite',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'slide-up': 'slide-up 0.4s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow':
          'conic-gradient(from 180deg at 50% 50%, #2a8af6 0deg, #a853ba 180deg, #e92a67 360deg)',
      },
    },
  },
  plugins: [],
} satisfies Config;
