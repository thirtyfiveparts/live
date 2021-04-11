const path = require('path')

// TODO(vjpr): This is not working for some reason, so we just use plain debug.
//   Maybe circular dep or something?
//const Debug = require('@live/log/es5').Debug
// ---
const Debug = require('debug')
const debug = Debug('@live/app-root')

// TODO(vjpr): Must support node and browser.

// TODO(vjpr): When not in browser, requires that the entry point is in the app root dir.

const isWallabyMainProcess = process.env.IS_WALLABY_MAIN
const isWallabyWorkerProcess = process.env.WALLABY
const isAvaTest = process.env.AVA_PATH

// TODO(vjpr): liveCliHelper should set this.
const repoRoot = process.cwd()

////////////////////////////////////////////////////////////////////////////////

// We do this to avoid any reference to public so we can symlink it if necessary.
// TODO: Make this `require`.
//   path.dirname(require('@live/public'))
const publicDir = process.env.PACKAGES_PUBLIC_DIR || 'public'
const packagesPublicDir = 'packages/' + publicDir
//const {dir, useDefault} = require('@live/dir-selector')
// TODO(vjpr): We need paths for this...can we extract the correct paths from requires using cwd and projectRoot?
// Not sure if its safe to do it here if we use this during pnpm install...it should be though.
// --

////////////////////////////////////////////////////////////////////////////////

// TODO(vjpr): This module should return a function.
//  I think we didn't do it because we wanted it fixed because webpack resolve fixes it.

const root = getRoot()

module.exports = root

function getRoot() {

  if (!process.browser) {
    // NOTE: worker and main can both be set at same time, so order is important here.
    if (isWallabyWorkerProcess) {
      console.log(
        'isWallabyWorkerProcess',
        path.resolve(
          global.wallabyProjectCacheDir,
          packagesPublicDir + '/apps/test',
        ),
      )
      return path.resolve(
        global.wallabyProjectCacheDir,
        packagesPublicDir + '/apps/test',
      )
    }

    if (isWallabyMainProcess) {
      // NOTE: `global.wallabyProjectCacheDir` is not set for babel presets though.
      if (global.wallabyProjectCacheDir) {
        const defaultRoot = path.resolve(
          global.wallabyProjectCacheDir,
          packagesPublicDir + '/apps/test',
        )
        return defaultRoot
      } else {
        // Because `babel-preset-live` uses `app-root`.
        return path.join(process.cwd(), packagesPublicDir + '/apps/test')
      }
    }
    if (isAvaTest) {
      return path.join(repoRoot, packagesPublicDir + '/apps/test')
    }

    // TODO(vjpr): Don't use this because it relies on the script being run to be in the app root.
    //   Sometimes we use a wrapper script.
    // NOTE: We check for null because its null in a webpack compile.
    //   See: https://github.com/webpack/webpack/issues/3244
    const directoryOfMainScript = require.main.filename ? path.dirname(require.main.filename) : null
    if (!global.__liveAppRoot__) {
      // TODO(vjpr): Make this a warning!
      debug(
        `'global.__liveAppRoot__' not set. You must tell this process the name of the app it is trying to run.`,
      )
    }

    // NOTE: We need to have a default because some scripts run babel-register themselves like `ava` from cli.
    return global.__liveAppRoot__ || directoryOfMainScript
  }

  return '~'

}

