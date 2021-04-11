import merge from 'webpack-merge'
import defaultConfig from '@live/chrome-extension/webpack/webpack.config.live.babel.js'

export default function (env, argv) {
  // For customizing the default config.
  const defaultConfigOpts = {
    chromeExtensionReloader: {
      port: 9091,
    },
  }
  // --
  const config = merge(defaultConfig(env, argv, defaultConfigOpts), overrides())
  return config
}

// For customizing the webpack config.
function overrides() {
  return {}
}
