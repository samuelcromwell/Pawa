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
        ink: "#0f172a",
        sun: "#f59e0b",
        mint: "#34d399",
        cloud: "#f8fafc",
      },
      boxShadow: {
        panel: "0 18px 55px -24px rgba(15, 23, 42, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
