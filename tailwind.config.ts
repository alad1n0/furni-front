import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      'black/600': '#1A1C18',
      'white/600': '#fff',
      'black/500': '#444444',
      'black/400': '#727272',
      'gray/600': '#3C3D34',
      'gray/400': '#9B9E93',
      'green-dark/600': '#596B00',
      'right-green': '#95DC32',
      'green-primary/600': '#C3D62C',
      'green-secondary/600': '#A4D27A',
      'green-primary/50': '#F0F4CE',
      'bg': '#F4F4F4',
      'gray/300': '#D1D1D1',
      'gray/200': '#DBDBDB',
      'gray/100': '#F4F4F4',
      'blue/50': '#E3F2FF',
      'blue/200': '#94AEBD',
      'blue/400': '#0094D5',
      'blue/600': '#064A76',
      'red/600': '#FF0000',
      'red/500': '#E43F3F',
      'red-dark/600': '#8E1F0B',
      'red-error/50': '#FEDAD9',
      'green-primary/50%': '#A4D27A80',
      'green-salat': '#8AB401',
      'emerald/500': '#29845A',
      'emerald/600': '#0C5132',
      'emerald/50': '#CDFEE1',
      'light-blue-opacity50': 'rgba(227, 242, 255, 0.50)',
      'yellow-attentiom/50': '#FFEF9D',
      'yellow/700': '#998A00',
      'yellow/800': '#4F4700',
      'react/400': '#2b303b',
      'react/500': 'rgb(35 39 47)',
      'react/600': 'rgb(21,35,45)',
      'react/300': 'rgb(153 161 179)',
      'orange/500': '#FF8C00',
      'purple/400': '#B95CF4',
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      borderRadius: {
        'base': '40px',
        'base-mini': '32px',
      },
      screens: {
        'xs': '480px',
        'sm': '610px',
        'tablet': '768px',
        'laptop': '1024px',
        'desktop': '1280px',
        'ultrawide': '1440px',
      },
      boxShadow: {
        'round': '0px 3px 16px 0px rgba(130, 145, 173, 0.25)'
      },
      keyframes: {
        "fade-in": {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        "fade-out": {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        pulseScale: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        "fade-in": "fade-in 0.2s ease-out forwards",
        "fade-out": "fade-out 0.2s ease-out forwards",
        pulseScale: 'pulseScale 1s infinite ease-in-out',
      },
      height: {
        'mobile': 'calc(100dvh - 64px)', // Для мобільних
        'tablet': 'calc(100dvh - 72px)', // Для планшетів
        'desktop': '100dvh', // Для десктопів
      },
      minHeight: {
        'mobile': 'calc(100dvh - 64px)', // Для мобільних
        'tablet': 'calc(100dvh - 72px)', // Для планшетів
        'desktop': '100dvh', // Для десктопів
      },
    },
  },
  plugins: [],
};
export default config;
