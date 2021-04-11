const {getLoaders, loaderByName, addBeforeLoader} = require('@craco/craco')
const {TypedCssModulesPlugin} = require('typed-css-modules-webpack-plugin')
// TODO(vjpr): This might slow down startup.
const _ = require('lodash')

module.exports = {
  overrideCracoConfig: ({
    cracoConfig,
    pluginOptions,
    context: {env, paths},
  }) => {
    // NOTE: `css.modules` only does `localIdent`.
    //_.set(cracoConfig, 'style.modules.camelCase', true)
    return cracoConfig
  },
  overrideWebpackConfig: ({
    webpackConfig,
    cracoConfig,
    pluginOptions,
    context: {env, paths},
  }) => {
    webpackConfig.plugins.push(
      new TypedCssModulesPlugin({
        globPattern: 'src/**/*.module.css',
        camelCase: true,
      }),
    )

    /////////////////////////////////////////////////////////////////////////////

    // Support `camelCase` in css-modules.

    // See: https://github.com/gsoft-inc/craco/blob/HEAD@%7B2019-06-20T16:05:13Z%7D/packages/craco/lib/features/style/css.js#L49

    const {hasFoundAny, matches} = getLoaders(
      webpackConfig,
      loaderByName('css-loader'),
    )
    const cssModuleLoaders = matches.filter(
      x => x.loader.options && x.loader.options.modules,
    )
    cssModuleLoaders.map(x => (x.loader.options.localsConvention = 'camelCase'))

    return webpackConfig
  },
}
