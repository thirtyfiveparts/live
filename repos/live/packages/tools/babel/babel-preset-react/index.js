module.exports = api => {
  const isTest = api.env('test')

  /**
   * Cache the returned value forever and don't call this function again. This is the default behavior but since we
   * are reading the env value above, we need to explicitly set it after we are done doing that, else we get a
   * caching was left unconfigured error.
   */
  api.cache(false)

  return {
    // Run last to first ordering.
    presets: [
      babelPluginPresetEnv(), // Imports, etc.
      require('@babel/preset-react'), // React.
      require('@live/babel-preset-basic'), // Typescript, etc.
    ],
    plugins: [
      // Don't add file location data attrs to elements in test because
      //   it clutters react element printing on errors + snapshots maybe too.
      // TODO(vjpr): When changing this we must clearCache it seems...
      !isTest ? reactElementInfo : false,
      // TODO(vjpr): Do we need this...or will webpack tree shake for us?
      //babelPluginImport(),
    ].filter(Boolean),
  }
}

////////////////////////////////////////////////////////////////////////////////

function babelPluginPresetEnv() {
  return [
    '@babel/preset-env',
    {
      targets: {
        browsers: 'last 2 versions',
      },
      // TODO(vjpr): Not sure if we need this or not.
      //   https://github.com/babel/babel-loader/issues/521
      //   We have to think about Jest and Webpack targets.
      // > If you are using a bundler, `auto` is always preferred.
      //modules: isTest ? 'commonjs' : false,
      // We want it to be false to there is tree-shaking in webpack.
      // NOTE(vjpr): This shouldn't be needed as `babel-jest` passes in the `caller`
      //   option to declare it doesn't support ESM which will automatically use `commonjs`.
      //modules: isTest ? 'commonjs' : 'auto',
      // --
    },
  ]
}

////////////////////////////////////////////////////////////////////////////////

// See: https://github.com/ant-design/babel-plugin-import/issues/402#issuecomment-572911452
function babelPluginImport() {
  const options = {
    libraryName: 'antd',
    style: true,
    libraryDirectory: 'es',
  }
  return [require('babel-plugin-import'), options]
}

////////////////////////////////////////////////////////////////////////////////

// TODO(vjpr): Don't publish this to prod!
// Not including local builds for rsyncing remotely.
//const isLocal = process.env.IS_LOCAL_BUILD
const isLocal = true

//const isReactElementInfoEnabled = isLocal || process.env.ENABLE_REACT_ELEMENT_INFO
const isReactElementInfoEnabled = true

const reactElementInfo = (() => {
  if (isReactElementInfoEnabled) {
    return [
      // Must use require.resolve for when we symlink our packages dir.
      // It only appears we need to do this for local linked packages. (e.g not lodash, but for @live/ packages in this repo)
      require.resolve('@live/babel-plugin-react-element-info'),
      {
        ignore: ['Link'],
        getFile,
        showFile: isLocal,
      },
    ]
  }
  return null
})()

function getFile(f, l, c) {
  // NOTE: Props never linkify in the Chrome dev tools. Only `src` does it seems.

  // RemoteCall - not maintained
  //const p = `http://localhost:8091?message${f}:${l}:${c}`
  // Idea protocol.
  //const p = `idea://?file=${f}&line=${l}&column=${c}`
  // Idea REST API.
  //const p = `http://localhost:63342/api/file?file=${f}&line=${l}&column=${c}`
  // Relative from repo root.
  //const p = path.relative(process.cwd(), f)
  // Full path.
  const p = `${f}:${l}:${c}`

  return p
}

////////////////////////////////////////////////////////////////////////////////
