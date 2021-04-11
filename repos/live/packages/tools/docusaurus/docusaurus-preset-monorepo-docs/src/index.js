import path, {join} from 'path'
import remarkCodeImport from 'remark-code-import'
import remarkMermaid from 'remark-mermaid'
import remarkMonorepoRefs from '@live/remark-docusaurus-monorepo-refs'
import fse from 'fs-extra'
import rehypePathPlugin from '@live/rehype-path-plugin'
import remarkToc from '@live/remark-docusaurus-toc-plugin'
import fs from 'fs'
import remarkMermaidDataurl from 'remark-mermaid-dataurl'
import remarkGithub from 'remark-github'
import remarkLiveGithub from '@live/remark-github-modern'
import readPkg from 'read-pkg'

export default function preset(context, opts = {}) {
  // NOTE: This runs on every file change.

  // We pass in workspace packages.
  const {workspacePackages: pkgs} = opts

  const repoEditBase = 'https://github.com/live/live/edit/master/'

  let plugins = []

  // Docs plugins

  // TODO(vjpr): Should change to `docusaurus.docs.enable`.
  const docusaurusPkgs = pkgs.filter(p => {
    const docusaurus = p.manifest.live?.docusaurus
    return docusaurus?.enable || docusaurus?.docs?.enable
  })
  docusaurusPkgs.map(pkg => {
    let folder

    // docs
    folder = pkg.manifest.live?.docusaurus?.docs?.folder ?? ''
    //if (pkg.manifest.live?.docusaurus?.isRoot) folder = 'docs'

    let customSidebarPath = 'docs/sidebar.js'
    const docsPlugin = makeDocsPlugin(pkg, {
      repoEditBase,
      folder,
      customSidebarPath,
      // TODO(vjpr): We would need to also exclude this from webpack using a plugin.
      //customInclude: ['!**/docs-shared/**'],
    })
    plugins.push(docsPlugin)
  })

  // Blog plugins

  const blogPkgs = pkgs.filter(p => p.manifest.live?.docusaurus?.blog?.enable)
  plugins.push(
    ...blogPkgs.map(pkg => {
      return makeBlogPlugin(pkg, {repoEditBase})
    }),
  )

  // Other plugins

  // We use this plugin to make any customizations we need to webpack, etc.
  plugins.push(require.resolve('@live/docusaurus-plugin'))

  // Preset

  const preset = {
    themes: [],
    // NOTE: Plugins cannot be functions - they must be paths or they are silently ignored.
    // TODO(vjpr): Submit a bug.
    plugins,
  }

  //console.log({preset})

  return preset
}

////////////////////////////////////////////////////////////////////////////////

let repoRoot

function getRepoRoot() {
  if (repoRoot) return repoRoot
  const findUp = require('find-up')
  const path = require('path')
  const rootPath = findUp.sync('pnpm-workspace.yaml', {cwd: process.cwd()})
  repoRoot = path.dirname(rootPath)
  return repoRoot
}

////////////////////////////////////////////////////////////////////////////////

function remarkLinkify() {}

////////////////////////////////////////////////////////////////////////////////

// If `dontSuffix = true`, only one plugin may be registered per root.
function idFromPackageName(pkgName, folder, dontSuffix = true) {
  // @live/foo-bar.baz => live_foo_bar__baz
  let out = pkgName
    .replace('@', '')
    .replace(/-/g, '_')
    .replace('/', '_')
    .replace(/\./g, '__')
  if (folder !== '' && !dontSuffix) out += '_' + folder
  return out
}

////////////////////////////////////////////////////////////////////////////////

// TODO(vjpr): Make exclude customizable per package.
const defaultInclude = ['**/*.md', '**/*.mdx']
const defaultExclude = ['!**/node_modules/**']

function makeDocsPlugin(
  pkg,
  {repoEditBase, folder, customSidebarPath, customInclude},
) {
  const {manifest, dir} = pkg
  const {
    id,
    absContentPath,
    relContentPath,
    repoRootRelContentPath,
    routeBasePath,
  } = getPluginInfo(pkg, folder)

  //const docsFolder = manifest.live?.docusaurus?.docs.folder
  //...defaultInclude.map(glob => docsFolder ? docsFolder + '/' + glob : glob),

  // To see how Docusaurus makes use of these:
  //   https://github.com/facebook/docusaurus/issues/4055#issuecomment-764894490
  //   They are concatenated to their relative path from the docs project.
  const include = [
    ...defaultInclude,
    ...defaultExclude,
    ...(manifest.live?.docusaurus?.include ?? []),
    ...(customInclude ?? []),
  ]

  // Sidebar
  // --------------------

  // Resolve `sidebarPath` relative to pkg if defined.
  const sidebarPathPkgRel =
    manifest.live?.docusaurus?.sidebarPath ?? customSidebarPath
  let sidebarPath
  if (sidebarPathPkgRel) {
    // Use custom `sidebar.js` location from package.json.
    sidebarPath = safeResolve(join(dir, sidebarPathPkgRel))
  } else {
    sidebarPath = safeResolve(join(absContentPath, 'sidebar.js'))
  }
  if (!sidebarPath) sidebarPath = 'sidebar.js'

  const repository = getRepoRootGitRepository()

  // ---------------------

  const pluginOpts = {
    id,
    // We must use the relative path to the `docs` package here (which is process.cwd() - NOT the repo root).
    // TODO(vjpr): Make configurable from `pkg.manifest`.
    // TODO(vjpr): How can we include the root `markdown.md`?
    //   Would need to modify the Docu plugins `getPathsToWatch`, and the `webpackConfigure` method.
    //   There are too many points where things would need to be modified.
    //   See: https://stackoverflow.com/questions/65683904/add-a-file-outside-of-the-site-dir-to-docusaurus-plugin-content-docs
    //   Using `pkgPath` scans all `node_modules` which would be too slow.
    path: relContentPath,
    // --
    editUrl: join(repoEditBase, repoRootRelContentPath),
    routeBasePath,
    sidebarPath,
    // See the compiler chain of mdx content here: https://mdxjs.com/advanced/plugins
    // TODO(vjpr): Maybe try `.jsx` too.
    rehypePlugins: [
      //[rehypeAutolinkHeadings, {behavior: 'wrap'}],
      [rehypePathPlugin, {}],
    ],
    // BUG: One of these plugins contains code that swallows errors. Very bad!
    remarkPlugins: [
      [remarkCodeImport, {}],
      // Needed for: https://github.com/facebook/docusaurus/issues/4006.
      // We also tweak which heading levels the contents should show for.
      remarkToc,
      // --
      [remarkMonorepoRefs, {}],
      [remarkMermaidDataurl, {}],
      [remarkGithub, {repository}],
      [remarkLiveGithub, {}]
    ],

    include,
  }
  //console.log('Making docs plugin with config:', opts)
  //return [require.resolve('@docusaurus/plugin-content-docs'), pluginOpts]
  return [require.resolve('@live/docusaurus-plugin-content-docs'), pluginOpts]
}

function getRepoRootGitRepository() {
  const pjson = readPkg.sync({cwd: join(getRepoRoot())})
  const url = pjson.repository?.url
  return url
}

function makeBlogPlugin(pkg, {repoEditBase}) {
  const {manifest, dir} = pkg
  const folder = 'posts'
  const {
    id,
    absContentPath,
    relContentPath,
    repoRootRelContentPath,
    routeBasePath,
  } = getPluginInfo(pkg, folder)
  const include = [
    ...defaultInclude,
    ...defaultExclude,
    ...(manifest.live?.docusaurus?.include ?? []),
  ]
  const pluginOpts = {
    id,
    path: relContentPath,
    blogTitle: 'Blog title',
    blogDescription: 'Blog',
    routeBasePath,
    editUrl: join(repoEditBase, repoRootRelContentPath),
    // NOTE: The rel path is prepended to all these.
    include,
  }
  return [require.resolve('@docusaurus/plugin-content-blog'), pluginOpts]
}

////////////////////////////////////////////////////////////////////////////////

// Plugin vars that are shared between docs and blog.
function getPluginInfo(pkg, folder) {
  const {manifest, dir} = pkg
  const pkgPath = dir
  const repoRoot = getRepoRoot()
  const absContentPath = join(pkgPath, folder)
  const isRoot = pkg.manifest.live?.docusaurus?.isRoot

  // Sometimes its handy to use a `package.json` to store deps only needed for docs.
  //throwIfNodeModulesExists(absContentPath)

  let relContentPath = path.relative(process.cwd(), absContentPath)

  // For root dir to avoid error "path cannot be empty".
  if (relContentPath === '') relContentPath = '.'

  const repoRootRelContentPath = join(path.relative(repoRoot, pkgPath), folder)
  const {name} = manifest
  //const routeBasePath = encodeURIComponent(name)
  // NOTE: Bug with dashes.
  const id = idFromPackageName(name, folder, isRoot)
  const routeBasePath = id

  return {
    id,
    absContentPath,
    relContentPath,
    repoRootRelContentPath,
    routeBasePath,
  }
}

function throwIfNodeModulesExists(absContentPath) {
  // If there is a `node_modules` in the `docs` folder all markdown files within its tree will be attempted to be parsed causing an error.
  //   For now we just alert user.
  // TODO(vjpr): We can probably remove this if we use `getPathsToWatch`.
  const docsNodeModules = join(absContentPath, 'node_modules')
  if (fse.existsSync(docsNodeModules)) {
    throw new Error(`'${docsNodeModules}' exists and it shouldn't`)
  }
}

function safeResolve(p) {
  try {
    return require.resolve(p)
  } catch (e) {
    return null
  }
}
