/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        neon: "0 0 25px rgba(56, 189, 248, 0.35), 0 0 60px rgba(167, 139, 250, 0.18)",
      },
      keyframes: {
        floatOrb: {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "50%": { transform: "translateY(-10px) scale(1.02)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.75" },
          "50%": { transform: "scale(1.06)", opacity: "1" },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        floatOrb: "floatOrb 6s ease-in-out infinite",
        breathe: "breathe 3.5s ease-in-out infinite",
        gradientShift: "gradientShift 12s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

