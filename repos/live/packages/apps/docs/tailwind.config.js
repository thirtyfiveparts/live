// TODO(vjpr): This seems to not be read.

console.log('hi1')
const plugin = require('tailwindcss/plugin')

module.exports = {
  theme: {
    extend: {
      colors: {},
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    // TODO(vjpr): Need to align these with Infima default styles...
    plugin(function({addBase, theme}) {
      addBase({
        h1: {fontSize: theme('fontSize.2xl')},
        h2: {fontSize: theme('fontSize.xl')},
        h3: {fontSize: theme('fontSize.lg')},
        h4: {fontSize: theme('fontSize.lg')},
        h5: {fontSize: theme('fontSize.lg')},
      })
    }),
  ],
}
