/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    container: {
      center: true,
      padding: 24,
    },
    screens: {
      lg: { max: "992px" },
      mobile: { max: "576px" },
    },
    extend: {
      colors: {
        pageBg: "#0E0F20",
        background2: "#171D36",
        white: "#f0f0f0",
        yellow: "#f4fd2b",
        window1: "#14182F",
        window2: "#1D2442",
        borderColor: "#272F50",
        darkGray: "#8A95C1",
      },
      boxShadow: {
        shadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)",
      },
      fontFamily: {
        raleway: "Raleway",
      },
    },
  },
  plugins: [],
};
