// npm-check is also good.

import depcheck from 'depcheck'
import {getPackageDirFromName} from '@live/get-workspace-pkgs'
import c from 'chalk'
import _ from 'lodash'

export default async function ({pkgName}) {
  console.log(`Running depcheck for '${pkgName}'`)
  const pkgDir = await getPackageDirFromName(pkgName)

  // Options
  //////////////////////////////////////////////////////////////////////////////

  // Because `ttypescript` is failing to parse `tsconfig.json` with line comments.
  // See: https://github.com/depcheck/depcheck/issues/614
  const excludeSpecials = ['ttypescript']

  const opts = {
    ignoreBinPackage: false,
    // TODO(vjpr): Allow local ignores - need to specify peer deps.
    // TODO(vjpr): Ignore singletons that must be used from the repo root.
    //   These should be peers but sometimes they are not.
    ignoreMatches: [
      // Becasue it is relatively referenced in `tsconfig.json`.
      '@live/tsconfig',
      // Babel aliases.
      '@src/*',
      // Global taols
      // TODO(vjpr): Depends if its a publishable package really. We should check the `pkg.manifest.live.app`.
      'ava',
      'concurrently',
      // Used by our graphql-codegen programmatic package to tell which api a client depends on.
      '@live/api',
    ],
    specials: getSpecials(excludeSpecials),
  }

  // Print output
  //////////////////////////////////////////////////////////////////////////////

  let cmd

  const unused = await depcheck(pkgDir, opts)

  console.log('Unused')
  console.log(unused.dependencies) // an array containing the unused dependencies
  console.log(unused.devDependencies) // an array containing the unused devDependencies
  const allUnused = _.flatten([unused.dependencies, unused.devDependencies])
  cmd = `pnpm remove --filter=${pkgName} ${allUnused.join(' ')}`
  printCmd(cmd)

  console.log('Missing')
  console.log(unused.missing) // a lookup containing the dependencies missing in `package.json` and where they are used

  console.log('Run this (you may have to decide what is a dev dep vs. dep)')
  cmd = `pnpm add --filter=${pkgName} ${Object.keys(unused.missing).join(' ')}`
  printCmd(cmd)

  console.log('Invalid')
  console.log(unused.invalidFiles) // files that cannot access or parse
  console.log(unused.invalidDirs) // directories that cannot access

  //console.log(unused.using) // a lookup indicating each dependency is used by which files
}

////////////////////////////////////////////////////////////////////////////////

function printCmd(cmd) {
  console.log()
  console.log(c.grey(cmd))
  console.log()
}

// Map object to array.
// TODO(vjpr): Rename to `mapToArrayAndExcludeByKey`...or objectAsFilteredList.
function getSpecials(excludeSpecials) {
  return Object.entries(depcheck.special)
    .filter(([name, fn]) => !excludeSpecials.includes(name))
    .map(([name, fn]) => fn)
}
