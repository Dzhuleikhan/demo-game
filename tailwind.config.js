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
      },
      boxShadow: {
        shadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)",
      },
    },
  },
  plugins: [],
};
