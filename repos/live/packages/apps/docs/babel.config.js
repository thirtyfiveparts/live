module.exports = {
  presets: [require.resolve('@docusaurus/core/lib/babel/preset')],
  plugins: [
    [
      'babel-plugin-macros',
      {
        twin: {
          preset: 'styled-components',
          config: require.resolve('./tailwind.config.js'),
          debug: false,
        },
      },
    ],
  ],
}
