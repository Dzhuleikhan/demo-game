const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    container: {
      center: true,
      padding: 24,
    },
    screens: {
      xl: { max: "1200px" },
      lg: { max: "992px" },
      tbl: { max: "767px" },
      mobile: { max: "576px" },
      sm: { max: "480px" },
    },
    extend: {
      colors: {
        pageBg: "#0E0F20",
        background2: "#171D36",
        white: "#f0f0f0",
        black: "#0f0f0f",
        yellow: "#f4fd2b",
        window1: "#14182F",
        window2: "#1D2442",
        borderColor: "#272F50",
        darkGray: "#8A95C1",
        lightGray: "#a9aabf",
        purple: "#8726FF",
      },
      boxShadow: {
        shadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)",
        shadowTop: "0 -4px 4px 0 rgba(0, 0, 0, 0.25)",
        formBtnShadow: "inset 0 4px 4px 0 rgba(255, 255, 255, 0.75)",
      },
      fontFamily: {
        raleway: "Raleway",
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant("current", "&.active");
    }),
  ],
};
