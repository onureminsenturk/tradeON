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
          primary: "#0a0e17",
          secondary: "#111827",
          tertiary: "#1f2937",
          quaternary: "#374151",
        },
        text: {
          primary: "#f9fafb",
          secondary: "#9ca3af",
          muted: "#6b7280",
        },
        accent: {
          primary: "#06b6d4",
          hover: "#22d3ee",
        },
        profit: "#10b981",
        loss: "#ef4444",
        warning: "#f59e0b",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
