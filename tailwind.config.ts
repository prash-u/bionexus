import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nexus: {
          ink: "#040814",
          panel: "#081424",
          cyan: "#22d3ee",
          blue: "#38bdf8",
          violet: "#8b5cf6",
          emerald: "#34d399",
          amber: "#fbbf24"
        }
      },
      boxShadow: {
        glow: "0 0 36px rgba(34, 211, 238, 0.18)",
        violet: "0 0 32px rgba(139, 92, 246, 0.18)"
      }
    }
  },
  plugins: []
} satisfies Config;
