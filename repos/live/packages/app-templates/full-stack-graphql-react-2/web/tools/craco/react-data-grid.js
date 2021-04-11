const {getLoaders, loaderByName, addBeforeLoaders} = require('@craco/craco')

module.exports = {
  overrideWebpackConfig: ({
    webpackConfig,
    cracoConfig,
    pluginOptions,
    context: {env, paths},
  }) => {
    const loader = {
      test: /\.js$/,
      include: /node_modules\/react-data-grid\/lib/,
      use: [{
        loader: require.resolve('babel-loader'),
        options: {
          presets: ['@live/babel-preset-react', {}],
          // This is recommended in `react-data-grid@7` readme.
          //presets: [[
          //  '@babel/preset-env',
          //  {
          //    //bugfixes: true,
          //    shippedProposals: true,
          //    corejs: 3,
          //    useBuiltIns: 'entry',
          //  },
          //]],
        },
      }],
    }
    addBeforeLoaders(webpackConfig, loaderByName('babel-loader'), loader)
    return webpackConfig
  },
}
