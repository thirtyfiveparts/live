import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer'

export function analyzer() {
  return {
    plugins: [
      //new BundleAnalyzerPlugin({
      //  generateStatsFile: true,
      //  openAnalyzer: false,
      //}),
    ],
  }
}
