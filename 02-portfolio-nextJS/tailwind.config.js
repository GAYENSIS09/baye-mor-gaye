/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design system du PDF
        black: "#0A0A0A",
        "off-black": "#111111",
        white: "#FFFFFF",
        "off-white": "#F5F5F0",
        acid: "#AAFF00",        // vert fluo (accent principal)
        "acid-dim": "#88CC00",
        muted: "#888880",
        border: "#222222",
      },
      fontFamily: {
        // Polices éditorial / magazine
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "10xl": ["10rem", { lineHeight: "0.85" }],
        "9xl":  ["8rem",  { lineHeight: "0.87" }],
        "8xl":  ["6rem",  { lineHeight: "0.9"  }],
      },
      animation: {
        "fade-up":    "fadeUp 0.7s ease forwards",
        "fade-in":    "fadeIn 0.5s ease forwards",
        "slide-left": "slideLeft 0.6s ease forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideLeft: {
          "0%":   { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
