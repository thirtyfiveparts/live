import _ from 'lodash'
import merge from 'webpack-merge'
import {handleDeprecationWarnings} from '@src/util/handle-deprecation-warnings'

import {
  jquery,
  css,
  babel,
  minify,
  analyzer,
} from '@src/blocks/plugins'
import {chromeExtensionLoader} from '@src/blocks/presets/web-extension/plugins/chrome-extension-loader'
import {common} from '@src/blocks/presets/web-extension/plugins/common'
import {webExtensionFiles} from '@src/blocks/presets/web-extension/plugins/files'

// Export singletons
export {default as MiniCssExtractPlugin} from 'mini-css-extract-plugin'

export default function webExtensionPreset(env, argv, configOpts) {
  const rootDir = process.cwd()
  const {mode} = argv
  handleDeprecationWarnings()
  let configs = [
    // This comment is only to prevent prettier compacting multi-line array.
    common,
    jquery,
    chromeExtensionLoader,
    webExtensionFiles,
    analyzer,
    css,
    babel,
    minify,
  ]
  configOpts = configOpts ?? {}
  const opts = {mode, rootDir, config: configOpts}
  configs = configs.map(c => {
    const conf = _.isFunction(c) ? c(opts) : c
    return conf ?? {}
  })
  return merge(configs)
}
