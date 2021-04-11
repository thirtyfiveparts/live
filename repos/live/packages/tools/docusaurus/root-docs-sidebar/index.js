const findWorkspacePackagesSync = require('get-workspace-pkgs-sync')
const {join} = require('path')

// As sidebar files are invalidated on any file change we must cache workspace packages or else we experience
//   a 1 second penalty when searching for workspace packages.
// NOTE: I think this might be because we are using a child_process to run it sync...maybe its the node startup time.

function getDocusaurusPackages() {
  // TODO(vjpr): This slows down startup time.
  const pkgs = findWorkspacePackagesSync(process.cwd(), {cached: true})
  const docusaurusPkgs = pkgs.filter(p => p.manifest.live?.docusaurus?.enable)
  return docusaurusPkgs
}

exports.getPackagesSidebarItems = function getPackagesSidebarItems() {
  const docusaurusPkgs = getDocusaurusPackages()
  return docusaurusPkgs.map(pkg => {
    const id = idFromPackageName(pkg.manifest.name)
    return {
      type: 'link',
      label: pkg.manifest.name,
      href: join('/' + id, getSlug(pkg)), // Don't use relative link.
    }
  })
}

exports.getRepoSidebarItems = function () {
  let docusaurusPkgs = getDocusaurusPackages()
  docusaurusPkgs = docusaurusPkgs.filter(
    pkg => pkg.manifest.live?.repo,
  )
  return docusaurusPkgs.map(pkg => {
    const id = idFromPackageName(pkg.manifest.name)
    return {
      type: 'link',
      label: pkg.manifest.live?.repo?.name || pkg.manifest.name,
      href: join('/' + id, getSlug(pkg)), // Don't use relative link.
    }
  })
}

////////////////////////////////////////////////////////////////////////////////

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
