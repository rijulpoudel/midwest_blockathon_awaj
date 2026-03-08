/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          bg: "#0a0b0f",
          card: "#1e2736",
          border: "rgba(255,255,255,0.05)",
        },
        accent: {
          blue: "#6b8cae",
          red: "#c0193a",
          green: "#00c896",
        },
      },
    },
  },
  plugins: [],
};
