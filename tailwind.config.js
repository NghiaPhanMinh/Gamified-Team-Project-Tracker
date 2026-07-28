/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Sora", "ui-sans-serif", "system-ui"],
        sans: ["DM Sans", "ui-sans-serif", "system-ui"],
      },
      colors: {
        ink: "#1f2633",
        cream: "#faf8f2",
        parchment: "#f3eee3",
        ember: "#e76748",
        moss: "#6b9d75",
        violet: "#7761c7",
        lemon: "#f0cb62",
      },
      boxShadow: {
        soft: "0 14px 40px rgba(58, 48, 38, .08)",
        card: "0 5px 0 rgba(31, 38, 51, .05)",
      },
    },
  },
  plugins: [],
};
