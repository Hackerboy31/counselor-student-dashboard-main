import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#FBFCFD",
        surface: "#FFFFFF",
        panel: "#F8FAFC",
        border: {
          DEFAULT: "#E6E9EE",
          strong: "#D5DAE1",
        },
        ink: "#1B2733",
        muted: "#5B6675",
        subtle: "#8B95A3",
        accent: {
          DEFAULT: "#2F6F7E",
          hover: "#27606E",
          subtle: "#EAF2F3",
        },
        critical: { fg: "#9E3B47", bg: "#FBEDEE", border: "#EBC9CD" },
        high: { fg: "#A65A2E", bg: "#FBF0E7", border: "#EDD3BE" },
        moderate: { fg: "#7A6A2E", bg: "#F7F2E2", border: "#E3DAB8" },
        low: { fg: "#3F6B57", bg: "#ECF3EF", border: "#CBE0D5" },
      },
      fontFamily: {
        sans: ['"Inter Variable"', "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(16 24 40 / 0.04)",
        md: "0 4px 12px -2px rgb(16 24 40 / 0.10), 0 2px 4px -2px rgb(16 24 40 / 0.06)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(2px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 160ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
