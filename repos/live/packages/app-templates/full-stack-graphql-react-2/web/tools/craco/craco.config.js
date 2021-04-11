// To debug use:
//
//   BABEL_DISABLE_CACHE=1 DEBUG=-babel,babel*
//
//

// TODO(vjpr): Errors show like `[watch-cra] craco:  *** Cannot find ESLint loader (eslint-loader). ***`
//   We need to make them red and bigger and maybe desktop notifications.

const debug = false

// So we can load from `.env` before CRA takes over.
require('dotenv').config()

const {getLoaders, loaderByName, addBeforeLoader} = require('@craco/craco')
const {join} = require('path')
const reactDataGrid = require('./react-data-grid')
const typedCssModulesWebpackPlugin = require('./typed-css-modules-webpack-plugin')
const {WebpackConfigDumpPlugin} = require('webpack-config-dump-plugin')
const CracoLessPlugin = require('craco-less')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const {getLoader} = require('@craco/craco')
const {removeLoaders} = require('@craco/craco')
const externalReact = require('webpack-external-react')
const {DuplicatesPlugin} = require('inspectpack/plugin')
const {StatsWriterPlugin} = require('webpack-stats-plugin')
var DiskPlugin = require('webpack-disk-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')

const path = require('path')

const smp = new SpeedMeasurePlugin()

console.log('ENABLE_ANALYZER:', process.env.ENABLE_ANALYZER)

module.exports = function ({env, paths}) {
  return {
    plugins: [
      // Enable for react-data-grid@7
      // TODO(vjpr): Broken => TypeError: rules.some is not a function
      {plugin: reactDataGrid, options: {}},
      // --
      {plugin: typedCssModulesWebpackPlugin},
      {
        plugin: CracoLessPlugin,
        options: {
          lessLoaderOptions: {
            lessOptions: {
              modifyVars: {
                //'@primary-color': '#1DA57A',
              },
              javascriptEnabled: true,
            },
          },
        },
      },
    ],

    babel: {
      // NOTE: There are two `babel-loader` plugins in CRA now.
      loaderOptions: (babelLoaderOptions, {env, paths}) => {
        //console.log(JSON.stringify(babelLoaderOptions, null, 2))

        babelLoaderOptions.configFile = true
        babelLoaderOptions.babelrc = true
        babelLoaderOptions.rootMode = 'upward'
        babelLoaderOptions.babelrcRoots = join(getRepoRoot(), './repos/**')

        // We do this in our preset.
        //babelLoaderOptions.plugins?.push([
        //  'babel-plugin-module-resolver',
        //  {
        //    root: ['./src'],
        //    alias: {
        //      '@src': './src',
        //    },
        //  },
        //])

        return babelLoaderOptions
      },
    },
    devServer: (devServerConfig, {env, paths, proxy, allowedHost}) => {
      // TODO(vjpr): Change `output.path` to `dist-local-dev`.
      devServerConfig.writeToDisk = true
      return devServerConfig
    },
    webpack: {
      plugins: [
        // Inspectpack
        ////////////////////

        new DuplicatesPlugin({
          // Emit compilation warning or error? (Default: `false`)
          emitErrors: false,
          // Display full duplicates information? (Default: `false`)
          verbose: true,
        }),

        ////////////////////

        new StatsWriterPlugin({
          filename: 'stats.json',
          stats: {
            //all: true,

            //assets: true,

            // TODO(vjpr): This will slow down the build.
            reasons: true,
            modules: true,
          },
          //fields: ['assets', 'modules'],
        }),

        //new DiskPlugin({
        //  output: {
        //    path: 'build',
        //  },
        //  files: [
        //    {asset: 'stats.json'},
        //    //{asset: /[a-f0-9]{20}\.main\.js/, output: {filename: 'file.js'}},
        //  ],
        //}),

        ////////////////////

        new WebpackConfigDumpPlugin({
          name: 'webpack.config.dump.json',
          depth: 10,
        }),
        parseInt(process.env.ENABLE_ANALYZER)
          ? new BundleAnalyzerPlugin({openAnalyzer: process.env.OPEN_ANALYZER})
          : null,
      ].filter(Boolean),
      configure: (webpackConfig, {env, paths}) => {
        // Change `build` path.
        // https://github.com/gsoft-inc/craco/pull/175
        //webpackConfig.output.path = env === 'production' ? 'build-prod' : null

        // Monorepo support
        ////////////////////

        // NOTE: This allows us to configure the loader itself rather than just the options as above.

        const {hasFoundAny, matches} = getLoaders(
          webpackConfig,
          loaderByName('babel-loader'),
        )

        if (hasFoundAny) {
          // So that it will compile our packages outside the app root.
          matches[0].loader.include = [getRepoRoot(), paths.appSrc]
          matches[0].loader.exclude = [
            /node_modules/,
            debug ? f => console.log('Processing:', f) : null,
          ].filter(Boolean)
          //console.log(matches[0].loader)
        }

        // Typescript
        ////////////////////

        // NOTE: No longer necessary.
        //webpackConfig.resolve.extensions.push('.tsx', '.ts')

        // Minification
        ////////////////////

        //console.log('opt', webpackConfig.optimization)
        webpackConfig.optimization.minimize = false

        // Disable `eslint-loader`
        ////////////////////

        // DEBUG
        //const {isFound, match} = getLoader(
        //  webpackConfig,
        //  loaderByName('eslint-loader'),
        //)
        //if (isFound) {
        //  console.log('Found eslint-loader and now removing it')
        //}

        // NOTE: No longer working in cra@4.
        //removeLoaders(webpackConfig, loaderByName('eslint-loader'))

        // ESLint (cra@4)
        ////////////////////

        const EXCLUDED_PLUGINS = ['ESLintWebpackPlugin']
        webpackConfig.plugins = webpackConfig.plugins.filter(
          plugin => !EXCLUDED_PLUGINS.includes(plugin.constructor.name),
        )

        // External React
        ////////////////////

        // Init externals.
        if (!webpackConfig.externals) {
          webpackConfig.externals = {}
        }

        //webpackConfig.alias = {
        //  react: path.resolve('./node_modules/react'),
        //}

        // Fixes: `Error: useLocation() may be used only in the context of a <Router> component.`
        //   https://stackoverflow.com/a/64410051/130910
        //Object.assign(webpackConfig.externals, externalReact.externals)
        //Object.assign(webpackConfig.externals, {
        //  react: 'React',
        //  'react-dom': 'ReactDOM',
        //  'react-router-dom': 'ReactRouterDOM',
        //})
        //webpackConfig.externals['react-router-dom'] = {
        //  commonjs: 'react-router-dom',
        //}
        //webpackConfig.module.noParse = externalReact.noParse

        ////////////////////

        // DEBUG
        // TODO(vjpr): Format better. Find a module that prints it nicely.
        //console.log(JSON.stringify(webpackConfig, null, 2))

        // NOTE: Good for timing but breaks %PUBLIC_URL% replacement in `index.html`.
        // See: https://github.com/stephencookdev/speed-measure-webpack-plugin/issues/55
        // TODO: Apparently 4.5.0 html-webpack-plugin fixes it but not supported yet by `react-scripts`.
        //return smp.wrap(webpackConfig)

        ////////////////////

        return webpackConfig
      },
    },
  }
}

////////////////////////////////////////////////////////////////////////////////

function getRepoRoot() {
  const findUp = require('find-up')
  const path = require('path')
  const rootPath = findUp.sync('pnpm-workspace.yaml', {cwd: process.cwd()})
  const repoRoot = path.dirname(rootPath)
  return repoRoot
}
