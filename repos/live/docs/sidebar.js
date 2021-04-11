// NOTE: Sidebar files are invalidated on each file change using `import-fresh`.
// See: node_modules/.pnpm/@docusaurus/plugin-content-docs@2.0.0-alpha.69_react-dom@16.14.0+react@16.14.0/node_modules/@docusaurus/plugin-content-src/sidebars.ts

const {getPackagesSidebarItems, getRepoSidebarItems} = require('@live/docusaurus-root-docs')
const packages = getPackagesSidebarItems()
const repos = getRepoSidebarItems()

const autoSidebar = require('@live/docusaurus-auto-sidebar') // Monorepo global.
const sidebar = autoSidebar(__dirname + '/..',  [], [/repos/, /tmp/])

module.exports = {
  someSidebar: {
    Monorepo: ['docs/readme', 'docs/monorepo', 'docs/motivation'],
    Repos: repos,
    // TODO(vjpr): Add package index file generated from pkgs.
    Packages: packages,
    //Packages: ['package-index', ...getPackagesSidebarItems()],
    // --
    Testing: ['docs/testing', 'docs/tasks', 'docs/debugging', 'docs/testing/wallaby'],
    Tips: ['docs/dot-dev'],
    CodeStyle: [
      'docs/style-guide/code-style',
      'docs/style-guide/react',
    ],
    Git: [
      'docs/git/index',
    ],
    Sidebar: sidebar,
  },
}
