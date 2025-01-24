/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        cinzel: ["Cinzel"],
        bonaNova: ["BonaNova"],
        grotesk: ["Clash Grotesk"]
      }
    },
    "animation": {
      "background-shine": "background-shine 2s linear infinite"
    },
    "keyframes": {
      "background-shine": {
        "from": {
          "backgroundPosition": "0 0"
        },
        "to": {
          "backgroundPosition": "-200% 0"
        }
      }
    }
  },
  plugins: [],
};
