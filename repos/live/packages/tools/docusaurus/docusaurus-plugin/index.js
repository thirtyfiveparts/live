const path = require('path')
const findUp = require('find-up')
const findWorkspacePackagesSync = require('get-workspace-pkgs-sync')

const {WebpackConfigDumpPlugin} = require('webpack-config-dump-plugin')
const {join} = require('path')

module.exports = function customWebpackPlugin(context, options) {
  return {
    name: 'custom-webpack-plugin',
    getPathsToWatch() {
      return [
        // Ignore repo root folders.
        //'!.dev/**', '!tmp/**'
      ]
    },
    configureWebpack(config, isServer, utils) {

      ////////////////////

      //config.plugins.push(function () {
      //  this.hooks.done.tapAsync('done', function (stats, callback) {
      //    if (stats.compilation.errors.length > 0) {
      //      TODO(vjpr): If we throw here it will crash docusuarus!
      //      throw new Error(
      //        stats.compilation.errors.map(err => err.message || err),
      //      )
      //    }
      //    callback()
      //  })
      //})

      ////////////////////

      //console.log({config, isServer})
      //config.devServer.quiet = false
      //console.log(JSON.stringify(config, null, 2))

      // Not working.
      // See: https://stackoverflow.com/questions/65683904/add-a-file-outside-of-the-site-dir-to-docusaurus-plugin-content-docs
      //includeRootMdxFiles(config)

      modifyBabelConfigForDocusaurusContentDocsPlugins(config, isServer, utils)

      return {
        plugins: [
          new WebpackConfigDumpPlugin({
            depth: 20,
            showFunctionNames: true,
            includeFalseValues: true,
            //keepCircularReferences: true,
          }),
        ],
        //devServer: {quiet: false},
      }
    },
  }
}

////////////////////////////////////////////////////////////////////////////////

// This is a hack until Docusaurus allows custom babel loader config for docs plugin.
// See: https://github.com/facebook/docusaurus/issues/4035
function modifyBabelConfigForDocusaurusContentDocsPlugins(
  config,
  isServer,
  utils,
) {
  const mdxRegex = /(\.mdx?)$/
  const matchingRules = config.module.rules.filter(
    rule => rule.test.toString() === mdxRegex.toString(),
  )

  //const {getBabelLoader} = utils

  matchingRules.map(rule => {
    const babelLoaders = rule.use.filter(use =>
      use.loader.match('babel-loader'),
    )
    babelLoaders.map(loader => {
      loader.options.configFile = join(process.cwd(), 'babel.config.js')
      delete loader.options.presets
      delete loader.options.babelrc
    })

    // Exclude node_modules.
    // TODO(vjpr): This should be in a separate plugin.
    // TODO(vjpr): Need to test this actually excludes properly!
    rule.exclude = rule.exclude ?? []
    rule.exclude.push(/node_modules/)

    // Fix: https://github.com/facebook/docusaurus/issues/4102
    rule.include = rule.include.map(include => {
      return include + '/'
    })
  })

  matchingRules.map(rule => {
    customExcludes(rule)
  })

}

////////////////////////////////////////////////////////////////////////////////

// This is a hack until docu content plugins are more configurable.
function customExcludes(rule) {
  // TODO(vjpr): This would normally come from each packages `package.json` but I was lazy and we need a better solution than modifying the webpack config manually.
  //const excludeRegistry = {
  //  'repos/sidekick': ['packages'],
  //  '': ['repos', '.dev', 'tmp'],
  //}

  const pkgs = findWorkspacePackagesSync(process.cwd(), {cached: true})
  const docusaurusPkgs = pkgs.filter(p => p.manifest.live?.docusaurus?.enable)

  const repoRoot = path.dirname(findUp.sync('pnpm-workspace.yaml'))

  // E.g.
  // include: [
  //  '/Users/Vaughan/dev-mono/thirtyfive/repos/live/packages/apps/docs/i18n/en/docusaurus-plugin-content-docs-live_app_templates__node_addon_cmake/current',
  //  '/Users/Vaughan/dev-mono/thirtyfive/repos/live/packages/app-templates/node-addon-cmake'
  // ],
  const includeSiteDir = rule.include.filter(include => !include.match('i18n'))
  const absPackageDir = includeSiteDir[0]

  const rootRelPackageDir = path.relative(repoRoot, absPackageDir)

  //const pkgRelExcludes = excludeRegistry[rootRelPackageDir]

  // We add trailing slash to include path above - so we must match on it.
  const pkg = docusaurusPkgs.find(pkg => (pkg.dir + '/') === absPackageDir)
  // NOTE: `absPackageDir` is unreliable as we could have other things in there like blogs, etc.
  if (!pkg) return

  const pkgRelExcludes = pkg.manifest.live?.docusaurus?.webpackLoaderExclude

  if (!pkgRelExcludes) return

  rule.exclude = rule.exclude ?? []

  // NOTE: Will fail webpack validation unless its a regex or abs string.
  pkgRelExcludes.map(p => {
    const regex = new RegExp(`${rootRelPackageDir}/${p}`)
    rule.exclude.push(regex)
  })

}
