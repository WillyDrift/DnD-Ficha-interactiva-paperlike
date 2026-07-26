import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Alimentados por variables CSS de la ficha (personalizables por personaje)
        sheetbg: "var(--bg)",
        detail: "var(--detail)",
        highlight: "var(--highlight)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        heading: ["var(--font-heading)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
