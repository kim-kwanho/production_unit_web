import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        factory: {
          green: "#22c55e",
          yellow: "#eab308",
          red: "#ef4444",
          slate: "#1e293b",
        },
      },
    },
  },
  plugins: [],
};

export default config;
