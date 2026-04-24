/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f2b4f',
        accent: '#ffb703',
        mint: '#7fe7dc'
      },
      boxShadow: {
        playful: '0 12px 28px -14px rgba(0,0,0,0.4)'
      }
    }
  },
  plugins: []
}
