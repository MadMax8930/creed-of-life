import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/types/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/styles/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#f3f4f6",
        secondary: "#fdfafa",
        tertiary: "#2B2C35",
      },
      fontFamily: {
         'first': ['Poppins', 'sans-serif'],
         'second': ['Bitter', 'serif'],
         'third': ['Raleway', 'sans-serif'],
         'fourth': ['Archivo Black', 'sans-serif'],
         'fifth': ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
         'hero-pattern': "url('/images/herobg.jpg')",
      },
      screens: {
         xs: "500px",
      },
    },
  },
  plugins: [],
} satisfies Config;
