const nodeExternals = require('webpack-node-externals')
const glob = require('globby')
const webpack = require('webpack')
import path, {join} from 'path'
import fs from 'fs'

export async function getWebpackConfig({cwd, root}) {
  return await getDefaultConfig({cwd, root})
}

export async function getDefaultConfig({cwd, root}) {
  const externals = nodeExternals({
    modulesDir: path.join(cwd, 'node_modules'),
  })

  // TODO(vjpr): Live locator
  const liveModules = glob
    .sync('modules/*/live.js', {cwd})
    .map(m => m.replace('modules/', ''))

  const cwdRealPath = fs.realpathSync(cwd)

  function makeRootsAbsolute(root) {
    return root.map(r =>
      path.isAbsolute(r) ? r : path.resolve(cwdRealPath, r),
    )
  }

  const config = {
    //context: cwd,
    context: cwdRealPath,
    //entry: ['./index'],

    //entry: ['./generated/live-browser-plugin-requires-generated.js', './src/server'],
    // DEBUG: For intranav-app test.
    //entry: ['./src/server', 'app-seed/live.js'].concat(liveModules),
    target: 'node',
    resolve: {
      root: makeRootsAbsolute(root),
      // Fallback to replant module.
      fallback: [path.join(__dirname, '../node_modules')],
    },
    //devtool: true,
    plugins: [
      new webpack.IgnorePlugin(/\.(css|less|scss)$/),
      new webpack.IgnorePlugin(/webpack\-stats\.json/),
      //new webpack.DefinePlugin({__NO_WEBPACK_STATS__: true}),
    ],
    resolveLoader: {root: makeRootsAbsolute(root)},
    module: {
      rules: [
        {
          test: [/\.jsx?$/, /\.tsx?$/],
          exclude: /(node_modules)/,
          //exclude: /(node_modules|bower_components)/,
          //include: /(src|modules)/, // 20210318Thu: Disabled.
          use: {
            //include: path.join(cwd, 'modules'),
            loader: require.resolve('babel-loader'),
            options: {
              rootMode: 'upward',
              // ---
              //presets: [require.resolve('babel-preset-es2015')],
              // DEBUG: For intranav-app test.
              //presets: ['babel-preset-live'],
              // --
              // TODO(vjpr): This must be excluded!
              //cacheDirectory: 'tmp-replant',
            },
          },
        },
      ],
    },
    externals: [externals],
  }

  return config
}

//function getNodeExternals(cwd) {
//  let externals = glob.sync(['node_modules/*', 'node_modules/@*/*'])
//  let keys = externals.map(mod => mod.replace('node_modules/', ''))
//  let vals = keys.map(k => 'commonjs ' + k)
//  externals = _.zipObject(keys, vals)
//  console.log(externals)
//  return externals
//}
