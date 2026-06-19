import type { Config } from "tailwindcss";

/**
 * HomeschoolHero design tokens — canonical reference.
 *
 * Tailwind v4 is configured CSS-first via `@theme` in `app/globals.css`,
 * which is where these tokens take effect. This file documents the same
 * palette for editor tooling and future migration. Source of truth for
 * values and usage: .cursor/skills/design/SKILL.md
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: "#050810",
        "card-hover": "#1e293b",
        subtle: "rgba(255, 255, 255, 0.08)",
        accent: {
          blue: "#3b82f6",
          purple: "#a855f7",
          green: "#22c55e",
          orange: "#f97316",
          gold: "#eab308",
          pink: "#ec4899",
          cyan: "#06b6d4",
        },
        maths: "#3b82f6",
        english: "#a855f7",
        science: "#22c55e",
        history: "#f97316",
        aics: "#06b6d4",
        gamedev: "#ec4899",
        homemaking: "#f43f5e",
        building: "#d97706",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(59, 130, 246, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
