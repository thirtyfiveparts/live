import MiniCssExtractPlugin from 'mini-css-extract-plugin'

export function css() {
  // Deprecation warnings will eventually be updated: https://github.com/webpack-contrib/mini-css-extract-plugin/issues/536#issuecomment-641462317
  return {
    plugins: [new MiniCssExtractPlugin({filename: 'style.css'})],
    module: {
      rules: [{
        test: /\.css$/,
        exclude: /node_modules/,
        use: [cssLoader, 'css-loader'],
      }],
    },
  }
}

export const cssLoader = {
  loader: MiniCssExtractPlugin.loader,
  options: {},
}
