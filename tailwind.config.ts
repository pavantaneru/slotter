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
        brand: {
          purple: "#7C00FE",
          yellow: "#F9E400",
          orange: "#FFAF00",
          red: "#F5004F",
          bg: "#FAFAFA",
          black: "#1A0A3D",
        },
      },
      boxShadow: {
        brutal: "4px 4px 0px #1A0A3D",
        "brutal-lg": "6px 6px 0px #1A0A3D",
        "brutal-xl": "8px 8px 0px #1A0A3D",
        "brutal-sm": "2px 2px 0px #1A0A3D",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
