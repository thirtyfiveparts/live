const Debug = require('debug')
const debug = Debug('@live/wallaby-config')

module.exports = function babelCompiler(wallaby) {
  const compiler = wallaby.compilers.babel(getWallabyBabelConfig(wallaby))
  return file => {
    console.log('Compiling:', file.path)
    // const {type, path, content, config} = file
    return compiler(file)
  }
}

function getWallabyBabelConfig(wallaby) {
  const {localProjectDir, projectCacheDir} = wallaby
  return {
    //babel: require('@babel/core'),
    plugins: [
      [
        require.resolve('babel-workspace-package-import-rewrite'),
        {localProjectDir, projectCacheDir},
      ],
    ],
    // These seem to be necessary.
    babelrc: true,
    configFile: true,
    // --
    // TODO(vjpr): Not sure if this is needed.
    //   https://github.com/wallabyjs/public/issues/477
    //sourceMap: 'both',
  }
}
