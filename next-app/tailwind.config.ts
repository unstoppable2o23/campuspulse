import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 950: "#0c3b2e", 800: "#1a5e48", 100: "#e3f0ea", 50: "#f2f8f5" },
      },
    },
  },
  plugins: [],
};
export default config;
