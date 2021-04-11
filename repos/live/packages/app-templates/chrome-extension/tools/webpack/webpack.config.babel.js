import merge from 'webpack-merge'
import defaultConfig, {
  MiniCssExtractPlugin,
} from '@live/chrome-extension/webpack/webpack.config.live.babel.js'

export default function (env, argv) {
  const config = merge(defaultConfig(env, argv), custom())
  return config
}

function custom() {
  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          include: /react-select/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ],
    },
  }
}
