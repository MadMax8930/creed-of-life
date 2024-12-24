import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#2B2C35",
        secondary: "#fdfafa",
        tertiary: "#f9d6d6",
      },
      fontFamily: {
         '1': ['Montserrat', 'sans-serif'],
         '2': ['Poppins', 'sans-serif'],
         '3': ['Crimson Pro', 'serif'],
         '4': ['Lora', 'serif'],
         '5': ['Bebas Neue', 'sans-serif'],
         '6': ['Oswald', 'sans-serif'],
         '7': ['Bitter', 'serif'],
         '8': ['Raleway', 'sans-serif'],
         '9': ['Fjalla One', 'sans-serif'],
         '10': ['Archivo Black', 'sans-serif'],
      },
      backgroundImage: {
         'hero-pattern': "url('/images/herobg.jpg')",
      },
    },
  },
  plugins: [],
} satisfies Config;
