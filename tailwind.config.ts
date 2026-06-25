import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        paper: "#f8f5ef",
        real: {
          50: "#eef8ff",
          100: "#d9efff",
          500: "#2477ff",
          600: "#175ee6",
          700: "#1549ba",
          900: "#14284f"
        }
      },
      boxShadow: {
        soft: "0 24px 80px rgba(23, 32, 51, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
