/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        nova: {
          bg: "#0B1120",
          panel: "#101727",
          card: "#141B2D",
          elevated: "#1B2438",
          border: "#222C42",
          borderLight: "#2A3552",
          primary: "#4F9CF9",
          primaryHover: "#6BAEFF",
          primaryDim: "#2D5A94",
          primaryLight: "#1A2940",
          amber: "#FFB454",
          amberDim: "#7A5A2A",
          success: "#34D399",
          warning: "#FFB454",
          danger: "#F87171",
          text: "#F1F5F9",
          textSoft: "#C2CADA",
          textMuted: "#8B96AB",
          textFaint: "#5B6478",
        },
      },
      fontFamily: {
        display: ["var(--font-lexend)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jbmono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        nova: "16px",
        "nova-sm": "12px",
        "nova-lg": "22px",
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 30px -8px rgba(0,0,0,0.5)",
        bubble: "0 1px 2px rgba(0,0,0,0.2)",
        glow: "0 0 0 1px rgba(79,156,249,0.4), 0 0 24px -4px rgba(79,156,249,0.5)",
        amberGlow: "0 0 0 1px rgba(255,180,84,0.35), 0 0 20px -6px rgba(255,180,84,0.45)",
      },
      keyframes: {
        "fade-in": { from: { opacity: 0 }, to: { opacity: 1 } },
        "slide-up": { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        "pop-in": { "0%": { opacity: 0, transform: "scale(0.92)" }, "100%": { opacity: 1, transform: "scale(1)" } },
        "bounce-dot": {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: 0.5 },
          "30%": { transform: "translateY(-4px)", opacity: 1 },
        },
        "border-flow": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-up": "slide-up 0.25s cubic-bezier(0.16,1,0.3,1)",
        "pop-in": "pop-in 0.18s cubic-bezier(0.16,1,0.3,1)",
        "bounce-dot": "bounce-dot 1.1s ease-in-out infinite",
        "border-flow": "border-flow 3s linear infinite",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};
