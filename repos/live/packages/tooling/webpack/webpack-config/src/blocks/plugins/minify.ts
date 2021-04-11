export function minify({mode}) {
  if (mode === 'production') {
    return {optimization: {minimize: true}}
  }
}
