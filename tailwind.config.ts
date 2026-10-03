import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          900: "#064e3b",
        },
        saffron: { 500: "#f59e0b", 600: "#d97706" },
      },
      fontFamily: { sans: ["system-ui", "Segoe UI", "Roboto", "sans-serif"] },
    },
  },
  plugins: [],
};

export default config;
