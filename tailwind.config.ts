import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)", surface: "var(--surface)", "surface-2": "var(--surface-2)",
        border: "var(--border)", text: "var(--text)", muted: "var(--text-muted)",
        flame: "var(--flame)", "flame-glow": "var(--flame-glow)", ice: "var(--ice)",
        measured: "var(--measured)", calculated: "var(--calculated)", literature: "var(--literature)", unavailable: "var(--unavailable)",
      },
      boxShadow: { flame: "0 0 32px rgba(255,107,44,.16)" },
      fontFamily: {
        display: ["Space Grotesk", "Inter", "ui-sans-serif", "system-ui"],
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular"],
      },
      borderRadius: { xl: "0.9rem" },
    },
  },
  plugins: [],
};

export default config;
