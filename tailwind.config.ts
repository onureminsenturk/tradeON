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
          primary: "#07060e",
          secondary: "#0f0e1c",
          tertiary: "#1a1830",
          quaternary: "#27233d",
        },
        text: {
          primary: "#f2f0ff",
          secondary: "#9490bb",
          muted: "#5e5a80",
        },
        accent: {
          primary: "#a78bfa",
          hover: "#8b5cf6",
        },
        profit: "#34d399",
        loss: "#fb7185",
        warning: "#fbbf24",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-accent': 'linear-gradient(135deg, #a78bfa, #60a5fa)',
        'gradient-profit': 'linear-gradient(135deg, #34d399, #10b981)',
        'gradient-loss': 'linear-gradient(135deg, #fb7185, #f43f5e)',
      },
      boxShadow: {
        'glow-accent': '0 0 30px rgba(167, 139, 250, 0.25)',
        'glow-profit': '0 0 24px rgba(52, 211, 153, 0.2)',
        'glow-loss': '0 0 24px rgba(251, 113, 133, 0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.5), 0 0 1px rgba(167,139,250,0.2)',
      },
    },
  },
  plugins: [],
};
export default config;
