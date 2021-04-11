// PERF = 180ms
// jsperf
const fastGlob = require('fast-glob')
// ---
const pFilter = require('p-filter')
const path = require('path')
const readPkg = require('read-pkg')

import {perf} from '@live/log/es5'

const DEFAULT_IGNORE = [
  '**/node_modules/**',
  '**/bower_components/**',
  '**/test/**',
  '**/tests/**',
]

let globDuration = 0
let readPkgDuration = 0

async function findPkgs(
  root: string,
  opts: {
    ignore?: string[],
    patterns?: string[],
    debug?: object,
  },
) {
  opts = opts || {}
  const globOpts = {...opts, cwd: root}
  globOpts.ignore = opts.ignore || DEFAULT_IGNORE
  globOpts.patterns = opts.patterns
    ? normalizePatterns(opts.patterns)
    : ['**/package.json']

  perf.start()
  let paths: string[]
  //console.log(globOpts.patterns, globOpts)
  if (process.env.LIVE_CLI_USE_LS) {
    // NOTE: We must include the symlink or it won't work.
    // TODO(vjpr): Must add more patterns.
    paths = await lsFiles(
      '{package.json,packages/public-symlink/**/package.json}',
      globOpts,
    )
  } else {
    //paths = await fastGlob('**/package.json', globOpts)
    paths = await fastGlob(globOpts.patterns, globOpts)
  }
  globDuration = perf.end()

  // PERF = 70ms
  const end = perf()
  const res = await pFilter(
    paths
      .map(path.dirname)
      .map(pkgPath => path.join(root, pkgPath))
      .map(async pkgPath => {
        let manifest
        try {
          manifest = await readPkg({cwd: pkgPath, normalize: false})
          return {path: pkgPath, manifest}
        } catch (err) {
          if (err.code === 'ENOENT') {
            return null
          }
          throw err
        }
      }),
    Boolean,
  )
  readPkgDuration = end()

  // Perf info.
  opts.debug?.({globDuration, readPkgDuration})

  return res
}

function normalizePatterns(patterns: string[]) {
  return patterns.map(pattern => pattern.replace(/\/?$/, '/package.json'))
}

// for backward compatibility
findPkgs['default'] = findPkgs // tslint:disable-line

module.exports = findPkgs

async function lsFiles(patterns = '**/package.json', {cwd}) {
  //const cmd = 'shopt -s globstar && ls -G ' + patterns
  const cmd = 'ls ' + patterns
  console.log(cmd)
  const opts = {cwd, shell: '/bin/zsh', encoding: 'utf8'}
  const out = require('child_process').execSync(cmd, opts)
  const res = out.split('\n')
  return res
}
