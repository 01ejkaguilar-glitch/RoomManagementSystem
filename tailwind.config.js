/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./views/**/*.{xian,hbs,html}",
    "./public/**/*.html",
    "./electron/**/*.js",
    "./controllers/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        brand: '#2C5D2B',
        'brand-accent': '#76A743',
        highlight: '#F4B400',
        info: '#4FA9E2',
        'neutral-bg': '#F5F8F4'
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.1)'
      },
      borderRadius: {
        xl: '0.75rem'
      }
    }
  },
  plugins: []
};
