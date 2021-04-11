import dotenv from 'dotenv'
import findWorkspacePackagesSync from 'get-workspace-pkgs-sync'
import path, {join} from 'path'

dotenv.config()

const pkgs = findWorkspacePackagesSync()
const docusaurusPkgs = pkgs.filter(p => p.manifest.live?.docusaurus?.enable)

function idFromPackageName(pkgName) {
  // @live/foo-bar.baz => live_foo_bar__baz
  return pkgName
    .replace('@', '')
    .replace(/-/g, '_')
    .replace('/', '_')
    .replace(/\./g, '__')
}

function getSlug(pkg) {
  return pkg.manifest.live?.docusaurus?.docs?.rootSlug ?? 'readme'
}

const packagesDropDownItems = {
  label: 'Packages',
  items: docusaurusPkgs.map((pkg) => {
    const {manifest} = pkg
    const id = idFromPackageName(manifest.name) + '/' + getSlug(pkg)
    return {
      to: id,
      label: manifest.name,
      position: 'left',
    }
  }),
}

function getRepoRootDocsNavBarItem() {
  const rootPkg = pkgs.find(({manifest}) => manifest.live?.docusaurus?.isRoot)
  const id = idFromPackageName(rootPkg.manifest.name)
  const repoRootItem = {
    to: id,
    label: 'Monorepo',
    position: 'left',
    //activeBasePath: '',
  }
  return repoRootItem
}

function getLiveMonorepoPresetPath() {
  // This function exists to make it easier to cmd+click navigate.
  const dummy = () => require('@live/docusaurus-preset-monorepo-docs')
  return require.resolve('@live/docusaurus-preset-monorepo-docs')
}

const config = {
  title: 'Live Monorepo Docs',
  tagline: 'Documentation of the monorepo for all Live JavaScript code.',
  url: 'https://monorepo.thirtyfive.dev',
  baseUrl: '/',
  onBrokenLinks: 'warn', // was throw
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'thirtyfive',
  projectName: 'thirtyfive',
  themeConfig: require('./docusaurus.theme.config')({
    getRepoRootDocsNavBarItem,
    packagesDropDownItems,
  }),
  plugins: [
    //docusaurusSearchLocal(),
    //docusaurusDotenv(),
    //docusaurusSitemap(),
    [
      require.resolve('docusaurus-lunr-search'),
      {
        languages: ['en', 'de'],
      },
    ],
  ],

  presets: [
    [
      getLiveMonorepoPresetPath(),
      {workspacePackages: pkgs},
    ],
    [
      '@docusaurus/preset-classic',
      {
        debug: true,
        docs: false,
        // Now defined by our preset.
        blog: false,
        //blog: {
        //  path: getRelBlogPath(),
        //  routeBasePath: 'blog',
        //  include: ['*.md', '*.mdx'],
        //  showReadingTime: true,
        //  // Please change this to your repo.
        //  editUrl:
        //    'https://github.com/thirtyfive/blog/edit/master/website/blog/',
        //},
        // --
        theme: {
          customCss: require.resolve('../src/css/custom.css'),
        },
      },
    ],
  ],
}
//console.log('Config')
//console.log(JSON.stringify(config, null, 2))

export default config

////////////////////////////////////////////////////////////////////////////////

function docusaurusSearchLocal() {
  //[
  //  require.resolve('@easyops-cn/docusaurus-search-local'),
  //  {
  //    hashed: true,
  //  },
  //],
  //  [
  //    '@docusaurus/plugin-content-docs',
  //    {
  //      id: 'tagger',
  //      //path: 'docs2',
  //      path: '../tagger/docs',
  //      editUrl: 'https://github.com/facebook/docusaurus/edit/master/website/',
  //      routeBasePath: 'tagger',
  //      //sidebarPath: require.resolve('../config/sidebarsFoo.js'),
  //      showLastUpdateAuthor: true,
  //      showLastUpdateTime: true,
  //    },
  //  ],
}

function docusaurusDotenv() {
  // ---
  // Causes error: `Module parse failed: parser.state.module.addPresentationalDependency is not a function`.
  //[
  //  require.resolve('@live/docusaurus-dotenv'),
  //  {
  //    systemvars: true,
  //  },
  //],
}

function docusaurusSitemap() {
  // ---
  // TODO(vjpr): It should be automaticaly configured with `@docusaurus/preset-classic`.
  //  [
  //    '@docusaurus/plugin-sitemap',
  //    {
  //      cacheTime: 600 * 1000, // 600 sec - cache purge period
  //      changefreq: 'weekly',
  //      priority: 0.5,
  //      trailingSlash: false,
  //    },
  //  ],
  // ---
}

// TODO(vjpr): Support multiple blogs!
function getRelBlogPath() {
  const repoRoot = getRepoRoot()
  const pkgPath = require('@thirtyfive/blog/dirname')
  const folder = 'posts'
  const blogPath = join(pkgPath, folder)
  const relBlogPath = path.relative(process.cwd(), blogPath)
  console.log({relBlogPath})
  return relBlogPath
}

function getRepoRoot() {
  const findUp = require('find-up')
  const path = require('path')
  const rootPath = findUp.sync('pnpm-workspace.yaml', {cwd: process.cwd()})
  const repoRoot = path.dirname(rootPath)
  return repoRoot
}
