import webpack from 'webpack'
import _ from 'lodash'

export function jquery() {
  const config = {plugins: getPlugins()}
  _.set(config, 'resolve.alias.jquery', getJqueryLib())
  return config
}

function getPlugins() {
  const jqueryLib = getJqueryLib()
  return [
    new webpack.ProvidePlugin({
      $: jqueryLib,
      jQuery: jqueryLib,
    }),
  ]
}

// Let's use a more lightweight jQuery library.
function getJqueryLib() {
  // Doesn't work because `arrive` needs `$.fn`.
  //return 'sizzle'
  // Too heavy.
  //return 'jquery'
  return 'jquery/dist/jquery.slim'
}
