import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // BMS brand colors
        bms: {
          blue: '#0033a0',
          lightBlue: '#0072ce',
          orange: '#ff6600',
          gray: '#63666a',
          lightGray: '#d0d3d4',
        },
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-out',
        'fade-out': 'fadeOut 300ms ease-out',
        'slide-in-right': 'slideInRight 300ms ease-out',
        'expand': 'expand 300ms ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        expand: {
          '0%': { width: '60vw', height: '60vh' },
          '100%': { width: '80vw', height: '80vh' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
