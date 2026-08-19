import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        rescue: {
          100: "#fef3c7",
          500: "#f59e0b",
          700: "#b45309",
        },
      },
      fontSize: {
        "kiosk-sm": ["1.05rem", "1.5rem"],
        "kiosk-base": ["1.25rem", "1.75rem"],
        "kiosk-lg": ["1.65rem", "2.1rem"],
        "kiosk-xl": ["2.25rem", "2.6rem"],
      },
    },
  },
  plugins: [],
};

export default config;
