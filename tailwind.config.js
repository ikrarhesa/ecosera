/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2A7B9B",
        accent: "#FF7A00",
        success: "#57C785",
        warn: "#EDDD53",
        ink: "#0B1220",
        mist: "#F7FAFC",
      },
      boxShadow: {
        glass: "0 1px 0 rgba(255,255,255,0.4) inset, 0 8px 24px rgba(15,23,42,0.12)",
      },
      borderRadius: {
        hero: "28px",
      },
    },
  },
  plugins: [],
};
