// These functions were removed from `sync.js`.
// I think I used it for debugging.

// TODO(vjpr):
// TODO(vjpr): We have to run this on all dependencies too, not just the root and app.
async function pnpmInstall(pkgNames) {
  pkgNames = _.castArray(pkgNames)
  const filters = pkgNames.map(pkgName => `--filter=${pkgName}...`).join(' ')
  const spawnOpts = {shell: true}

  // --offline --frozen-shrinkwrap --reporter=ndjson --ignore-scripts
  const flags = dargs({
    offline: true, // no network requests
    frozenShrinkwrap: true, // never update shrinkwrap
    reporter: 'ndjson',
    ignoreScripts: true
  }).join(' ')

  const {stderr} = await spawn(
    // --ignore-scripts is necessary if we install just pjsons first as some npm run build stages need everything available.
    `time pnpm i ${flags} ${filters}`,
    spawnOpts,
  )

  if (stderr) {
    //message:
    //      code: "ERR_PNPM_OUTDATED_SHRINKWRAP"
    //`ERROR  Cannot install with "frozen-shrinkwrap" because `pnpm-lock.yaml` is not up-to-date with packages/public-symlink/babel/babel-preset-live-node-simple/package.json`
    // ==> This means you probably need to run `pnpm i` in your original repo's dir.
  }
}
