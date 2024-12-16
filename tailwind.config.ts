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
         '1': ['Lobster', 'cursive'],
         '2': ['Dancing Script', 'cursive'],
         '3': ['Pacifico', 'cursive'],
         '4': ['Playfair Display', 'serif'],
         '5': ['Bebas Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
