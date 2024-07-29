/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
        colors:{
          mainColor:"#f94d1c",
          bgColor:'#000300',
          navBg:'rgb(0 0 0 /40%)'
        }
      
    },
  },
  plugins: [],
}