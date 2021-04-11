import c from 'chalk'
import path, {join} from 'path'
import {printCommands} from '@live/cli-core/src/livefile'
import indent from 'indent-string'
import getRunContext from '@live/cli/src/modules/run-context'
//import {renderHelp} from '@live/cli-shared'

// Must use /es5 because we may not want to run @babel/register.
import {spath} from '@live/log-style/es5'

function desc(...args) {
  return c.grey(...args)
}

export async function showGlobalHelp() {
  const pkgName = 'live-cli'
  const readPkgUp = await import('read-pkg-up')
  const pkgPath = readPkgUp.sync({cwd: __dirname}).path
  const relPath = path.relative(process.cwd(), pkgPath)

  let str = ''
  function log(txt) {
    str += (txt || '') + '\n'
  }

  // TODO(vjpr): See if we can show the relative non-realpath when public is symlinked.
  log(`Showing help for '${pkgName}' from ${spath(relPath)}`)
  log()

  log(c.bold('docs'))
  log(desc(`  Starts a server that allows easy browsing of all readme files in the monorepo.`))

  log(c.bold('stack <stack-name> <command>'))
  log(desc(`  Run commands on multiple apps (e.g. backend + frontend).`))

  log(c.bold('app <app-name> <command>'))
  log(desc(`  Run commands from an app's directory.`))

  log(c.bold('bin-root <bin-name>'))
  log(
    desc(
      '  Run a bin on the monorepo root, a bin that has been defined in a package in this monorepo.',
    ),
  )

  log(c.bold('bin <bin-name>'))
  log(
    desc(
      '  Run a bin on the working dir, a bin that has been defined in a package in this monorepo.',
    ),
  )

  // TODO(vjpr): This is similar to pnpm m run/exec --filter package
  // Maybe we should suggest they use that? But the api is not so nice.
  log(c.bold('pkg <command>'))
  log(desc('  Run a command on any package in this monorepo.'))
  // TODO(vjpr): Maybe allow filtering by attrs in the package.json or something?

  log(c.bold('repo <command>'))
  log(desc('  Run a command on the monorepo root package.'))

  log(c.bold('new <app|pkg> <template>'))
  log(desc('  Create a new app or package from a template.'))

  log(c.bold('new <app|pkg> <template>'))
  log(desc('  Create a new app or package from a template.'))

  log(c.bold('ps'))
  log(desc('  Print running processes started with live.'))

  log(c.bold('daemon'))
  log(desc('  Run the live daemon which will handle all cli commands and run a persistent process manager for performance.'))

  log(c.bold('watch'))
  log(desc('  Run a pluggable watcher to listen to file system changes and execute commands.'))

  log()
  log('TIP: To make it run as fast as possible (disk cache + precompiled) use:')
  log(c.bold('  lives -c'))
  //log('To check whether pre-compiled files need transpilation:')
  //log(c.bold('  NO_TRANSPILE_CHECKER=1 lives'))
  log()
  log('However, if you change the folder structure you must run without the env var again.')
  log()
  log('DEV TIP: To see what is slowing it down:')
  log(c.bold('  time DEBUG=perf PERF=1 live'))
  log('DEV TIP: To see all debugging info:')
  log(c.bold('  time DEBUG=*,-babel PERF=1 live'))

  log()

  log('----------')
  log()
  // TODO(vjpr): Replace appname with pjson#appName.
  // TODO(vjpr): Render markdown doc `config/docs/live-monorepo-instructions.md`.
  //log(c.bold(`APP_NAME Guide`))
  //log()
  //log('Welcome to the ')

  // --------------------

  console.log(str)

  // NOTE: Generators should be defined in an app. `live app foo generate controller bar`
  //   Or `live app foo -i` (load repl with context set to app foo)
  //   Then you can run a bunch of commands quick and easy.
}

export async function showHelp(project, {repoRoot, repoOnly, packageOrApp, cwd, projectRoot, config}) {
  console.log(
    'showing help for',
    c.underline(project.name),
    `(${project.pkgPath})`,
  )

  console.log()
  console.log(c.bold('bin'))
  console.log(
    desc(
      `  Run a bin defined in a package in this monorepo, in this ${packageOrApp}'s root.`,
    ),
  )
  // NOTE: This prevents you having to link monorepo-workspace packages into your app.

  // TODO(vjpr): Also support running `node_modules/.bin/X` too. (`npm bin`)
  //   Warn if there are duplicates.
  //   This might be useful for any package. But this is crossing over with pnpm's functionality. I think we should support it here though.
  //   The whole point of this live tool is for simplicity. pnpm can do it all really, but you have to use the package name's, not the simple dirName.

  // IMPORTANT: I think I remember that this is suppose to allow you to run
  //   a monorepo bin on this app - not this app's bins.
  //printSingleProjectBins(project)

  console.log()
  console.log(c.bold('run'))
  console.log(desc(`  Run 'npm run' in this ${packageOrApp}'s root`))
  console.log()

  printNpmCommands({project, repoRoot})

  console.log(c.bold('exec'))
  console.log(
    desc(`  Run an arbitrary shell command in this ${packageOrApp}'s root`),
  )

  console.log()
  console.log(
    c.bold(`cmd <livefile-command> ${c.grey('or just')} <livefile-command>`),
  )
  console.log(
    desc(
      `  Run a command defined in a livefile.js found in the ${packageOrApp} or repo root, or a live-cli default command`,
    ),
  )

  console.log()
  //const ctx = {}
  config.dryRunForPrinting = true
  const ctx = getRunContext({cwd, repoRoot, projectRoot, config})
  const commands = await printCommands({project, repoRoot, ctx, repoOnly})
}

export async function showRepoHelp(project, {repoRoot, repoOnly, cwd, projectRoot, config}) {
  console.log('showing help for monorepo root', `(${project.pkgPath})`)

  console.log()
  //const ctx = {}
  config.dryRunForPrinting = true
  const ctx = getRunContext({cwd, repoRoot, projectRoot, config})
  const commands = await printCommands({project, repoRoot, ctx, repoOnly})
}

////////////////////////////////////////////////////////////////////////////////

function printNpmCommands({project, repoRoot}) {

  const pkg = require('read-pkg').sync({cwd: project.root})

  let str = ''

  // TODO(vjpr): Group into lifecycle scripts and not.

  if (!pkg.scripts) return

  Object.entries(pkg.scripts).map(([k, v]) => {
    str += '- ' + k + '\n'
    str += indent(c.grey(v), 2) + '\n'
  })

  console.log(indent(str, 4))

}
