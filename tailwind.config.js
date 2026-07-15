/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // British academic palette from the specification.
        royal: {
          DEFAULT: "#0F294A",
          50: "#eaf0f7",
          100: "#c7d6e8",
          600: "#0F294A",
          700: "#0b1f39",
          800: "#081629",
        },
        crimson: {
          DEFAULT: "#D2143A",
          600: "#D2143A",
          700: "#a80f2e",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 30px -12px rgba(15, 41, 74, 0.25)",
      },
    },
  },
  plugins: [],
};
