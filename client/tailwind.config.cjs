/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#0b854a", // New primary green (button, 'regenerative' text)
          greenDeep: "#03482d", // Bottom stats banner
          greenPale: "#c5eccb", // Top left badge bg
          greenSoft: "#e4f8ec", // Light green background elements
          btnLight: "#e2f9e9", // 'Créer un compte' light button bg
          navy: "#0d1b3d",
          bg: "#ffffff",
          text: "#1e293b", // Slate 800
          muted: "#64748b" // Slate 500
        }
      },
      boxShadow: {
        soft: "0 20px 40px -15px rgba(0,0,0,0.05)",
        card: "0 0 40px rgba(0,0,0,0.03)"
      }
    }
  },
  plugins: []
};

