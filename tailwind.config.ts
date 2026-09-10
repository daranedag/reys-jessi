import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6f4a75",
        secondary: "#c58d83",
        accent: "#e4c995",
        cream: "#fbf8f3",
        ink: "#2f2830",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        sans: ["var(--font-montserrat)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 24px 70px rgba(74, 51, 70, 0.12)",
      },
    },
  },
  plugins: [forms],
} satisfies Config;
