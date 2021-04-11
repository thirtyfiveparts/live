import CopyWebpackPlugin from 'copy-webpack-plugin'

export function webExtensionFiles() {
  const patterns = [
    {from: 'icon.png'},
    {from: 'manifest.json'},
    {from: 'style.global.css'},
  ]
  return {plugins: [new CopyWebpackPlugin({patterns})]}
}
