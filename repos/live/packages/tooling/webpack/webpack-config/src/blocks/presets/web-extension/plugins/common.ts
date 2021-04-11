import path, {join} from 'path'
import webpack from 'webpack'
import {WebpackConfigDumpPlugin} from 'webpack-config-dump-plugin'

export function common({mode, rootDir, config: conf}) {
  const isDev = mode === 'development'
  let {entryPointFileExtension: ext} = conf
  ext = ext ?? 'js'

  const contentScriptDir = conf.contentScriptDir ?? '.'
  const backgroundDir = conf.backgroundDir ?? '.'

  const config = {
    context: join(rootDir, 'src'),
    output: {
      path: isDev ? join(rootDir, 'dist/dev') : join(rootDir, 'dist/prod'),
      filename: '[name].js',
    },
    // CSP problems if we use `eval-xxx`. Note that `content-script-injected` is injected into the target webpage as a content-script.
    devtool: isDev ? 'inline-cheap-source-map' : false,
    entry: {
      'content-script': `${contentScriptDir}/content-script.${ext}`,
      'content-script-injected': `${contentScriptDir}/content-script-injected.${ext}`,
      background: `${backgroundDir}/background.${ext}`,
    },
    plugins: [
      // React - Remove all the development oriented warnings and overhead.
      // This is automatically set to `development` when `mode = development`.
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      new WebpackConfigDumpPlugin({depth: 10}),
    ],
    //watchOptions: {
    //  poll: false,
    //  //ignored: /node_modules/,
    //},
  }

  return config
}
