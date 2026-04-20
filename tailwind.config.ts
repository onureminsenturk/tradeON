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
        bg: {
          primary: "#060909",
          secondary: "#0d1511",
          tertiary: "#172119",
          quaternary: "#243526",
        },
        text: {
          primary: "#eaf5eb",
          secondary: "#7da480",
          muted: "#4d6550",
        },
        accent: {
          primary: "#16c660",
          hover: "#0fa84f",
        },
        profit: "#1fd660",
        loss: "#f23535",
        warning: "#fbb424",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(22, 198, 96, 0.25)',
        'glow-red': '0 0 20px rgba(242, 53, 53, 0.25)',
      },
    },
  },
  plugins: [],
};
export default config;
