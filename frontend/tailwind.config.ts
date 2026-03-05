import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          0: "rgb(var(--surface-0) / <alpha-value>)",
          1: "rgb(var(--surface-1) / <alpha-value>)",
          2: "rgb(var(--surface-2) / <alpha-value>)",
          3: "rgb(var(--surface-3) / <alpha-value>)",
          4: "rgb(var(--surface-4) / <alpha-value>)",
        },
        profit: {
          DEFAULT: "rgb(var(--color-profit) / <alpha-value>)",
          dim: "rgb(var(--color-profit) / 0.15)",
          glow: "rgb(var(--color-profit) / 0.25)",
        },
        loss: {
          DEFAULT: "#ff4466",
          dim: "rgba(255,68,102,0.15)",
          glow: "rgba(255,68,102,0.25)",
        },
        accent: {
          blue: "#3b82f6",
          amber: "#ffaa00",
          purple: "#a855f7",
          cyan: "#06b6d4",
        },
        glass: {
          DEFAULT: "var(--glass-bg)",
          border: "var(--glass-border)",
          hover: "var(--glass-hover)",
        },
      },
      fontFamily: {
        display: ['"Sora"', "sans-serif"],
        body: ['"Manrope"', "sans-serif"],
        mono: ['"Fira Code"', "monospace"],
      },
      borderRadius: {
        glass: "16px",
      },
      backdropBlur: {
        glass: "20px",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-up": "slide-up 0.5s ease-out",
        "count-up": "count-up 0.8s ease-out",
        ticker: "ticker 30s linear infinite",
        shimmer: "shimmer 2s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "count-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
