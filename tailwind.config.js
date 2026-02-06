/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FCE4E9',
          100: '#F8C9D3',
          200: '#F19EAD',
          300: '#EA7387',
          400: '#CE1141',
          500: '#CE1141',
          600: '#A00E33',
          700: '#8B0C2B',
          800: '#6B0921',
          900: '#4A0617',
        },
        bulls: {
          50: '#FCE4E9',
          100: '#F8C9D3',
          200: '#F19EAD',
          300: '#EA7387',
          400: '#CE1141',
          500: '#CE1141',
          600: '#A00E33',
          700: '#8B0C2B',
          800: '#6B0921',
          900: '#4A0617',
        },
      },
    },
  },
  plugins: [],
}

