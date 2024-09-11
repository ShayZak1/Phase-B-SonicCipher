// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mainColor: "#f94d1c",
        bgColor: '#000300',
        navBg: 'rgb(0 0 0 /40%)',
      },
      animation: {
        "spin-around": "spin-around calc(var(--speed) * 2) infinite linear",
        slide: "slide var(--speed) ease-in-out infinite alternate",
        ripple: "ripple var(--duration,2s) ease calc(var(--i, 0)*.2s) infinite",
        waveMove: "waveMove 2s linear infinite", // Add the waveform animation here
      },
      boxShadow: {
        'glow': '0 0 8px rgba(255, 255, 255, 0.8), 0 0 16px rgba(255, 255, 255, 0.6), 0 0 24px rgba(251, 100, 21, 0.5)',
      },
      keyframes: {
        "spin-around": {
          "0%": {
            transform: "translateZ(0) rotate(0)",
          },
          "15%, 35%": {
            transform: "translateZ(0) rotate(90deg)",
          },
          "65%, 85%": {
            transform: "translateZ(0) rotate(270deg)",
          },
          "100%": {
            transform: "translateZ(0) rotate(360deg)",
          },
        },
        slide: {
          to: {
            transform: "translate(calc(100cqw - 100%), 0)",
          },
        },
        ripple: {
          "0%, 100%": {
            transform: "translate(-50%, -50%) scale(1)",
          },
          "50%": {
            transform: "translate(-50%, -50%) scale(0.9)",
          },
        },
        waveMove: { // Define the keyframes for the waveform animation
          "0%": {
            backgroundPosition: "0 0",
          },
          "100%": {
            backgroundPosition: "100% 0",
          },
        },
      },
    },
  },
  plugins: [],
};
