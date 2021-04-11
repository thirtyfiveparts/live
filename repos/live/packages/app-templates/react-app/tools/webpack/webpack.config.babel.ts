import merge from 'webpack-merge'
import defaultConfig, {
  MiniCssExtractPlugin,
} from '@live/webpack-config/src/blocks/presets/react-app'

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
