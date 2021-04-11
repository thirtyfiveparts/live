module.exports = api => {
  const isTest = api.env('test')
  return {
    babelrcRoots: [
      '.',
      'repos/**',
    ],
  }
}
