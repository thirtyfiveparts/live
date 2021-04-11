import _ from 'lodash'
import indent from 'indent-string'
import c from 'chalk'

export function printBins(projects) {
  printSortedByContainingDir(formatProjectBins, projects, 'repoContainingDir')
  //console.log(projects.map(formatProjectBins).join(''))
}

export function printSortedByContainingDir(formatProject, projects, sortKey) {
  if (!projects.length) {
    console.log('None found')
  }
  // We want to sort based on which dir contains the apps.
  const sortedProjects = _.groupBy(projects, sortKey)
  Object.entries(sortedProjects).map(([containingDir, projects]) => {
    console.log()
    if (!containingDir || containingDir === 'undefined')
      containingDir = '<other>'
    console.log(indent(containingDir + ':', 1))
    console.log(
      indent(projects.map(p => formatProject(p, containingDir)).join('\n'), 1),
    )
  })
}

// TODO(vjpr): Do indents better. Return strings instead of console.log.
//   Check all usages before changing!!!

export function printRunnableCommand(name, fn, command) {
  const indent = '    '
  const desc =
    fn?.description || fn?.desc || command.description || `Run ${name} command.`
  let str = '- ' + name
  if (!command.available) {
    //console.log(indent + c.strikethrough(str)) // Strikethrough not working on iTerm.
    console.log(indent + c.dim(str))
  } else {
    console.log(indent + str)
  }

  // Command string - this is the actual shell command being run.

  if (command.fn) {
    // Run command with dry run.
    // TODO(vjpr): This takes `prepareCommandArgs`.
    //command.fn({project, args, argv, argvStart, argvEnd, source})
  }

  if (command.cmdStr) {
    console.log('      ' + c.grey(command.cmdStr))
  }
  // --

  if (desc) {
    console.log('      ' + c.grey(desc))
  }
}

// Adds heading with source of commands.
// commandType - pretty text of command type. E.g. Live Next.js App
export function printRunnableCommandsOfType(commandType, commands) {
  if (!commands.length) return
  console.log('   ' + commandType + ':')
  if (!commands.length) return console.log('    - <empty>')
  printRunnableCommands(commandType, commands)
}

function printRunnableCommands(commandType, commands) {
  for (const command of commands) {
    const {name, fn} = command
    printRunnableCommand(name, fn, command)
  }
}

export function printFeatureCommands(
  commandTypeStr,
  features,
  availableFeatures,
) {
  if (!Object.keys(features).length) return
  console.log('   ' + commandTypeStr + ':')
  if (availableFeatures)
    console.log(
      c.grey(
        '   Available features in current package: ' +
          availableFeatures?.join(', '),
      ),
    )
  for (const [featureName, commands] of Object.entries(features)) {
    printRunnableCommands('feature', commands)
  }
}

export function listProjects({projects, config, cwd}) {
  // TODO(vjpr): Print a warning if two projects have the same name.
  console.log()
  console.log(sectionHeaderApps('Apps'))
  printProjects(projects.filter(p => p.isApp))
  console.log()
  console.log(sectionHeaderApps('App Templates'))
  printProjects(projects.filter(p => p.isAppTemplate))
  console.log()
  console.log(sectionHeaderRepoBinsFromRepoRoot())
  printBins(projects.filter(p => p.bins))
}

export function listPackages({projects, config, cwd}) {
  console.log()
  console.log(sectionHeaderApps('Packages', 'package'))
  printProjects(projects)
  //printProjects(projects.filter(p => !p.isApp))
  console.log()
  console.log(sectionHeaderRepoBinsFromRepoRoot())
  printBins(projects.filter(p => p.bins))
}

export function printProjects(projects) {
  if (!projects.length) {
    console.log()
    console.log('  None found')
  }
  // TODO(vjpr): Sort by appFolder.
  //console.log(projects)

  printSortedByContainingDir(formatProject, projects, 'repoContainingDir')
}

function printSingleProjectBins(project) {
  console.log()
  console.log(formatProjectBins(project))
}

////////////////////////////////////////////////////////////////////////////////

function formatProjectBins(p, trimPathPrefix) {

  let str = []

  if (!p.bins) {
    console.log('  None found')
  }

  // See: https://docs.npmjs.com/cli/v6/configuring-npm/package-json#bin
  if (!_.isObject(p.bins)) {
    printBin(p.name, p.bins)
    return
  }

  _(p.bins)
    .map((file, binName) => {
      printBin(file, binName)
    })
    .value()

  function printBin(file, binName) {
    // TODO(vjpr): Show if there are no bins when printing package bins.
    const nameStr = c.grey(`(${p.name})`)
    // If the pkg path is being printed with part of is path in the header (i.e sorted by containing dir), we don't need to print that.
    const pkgPath = p.pkgPath.replace(trimPathPrefix, '...')
    const pkgPathStr = c.cyan(`(${pkgPath})`)
    str.push(` - ${binName} ${nameStr} ${pkgPathStr}`)
  }

  return str.join('\n')

}

export function formatProject(p, trimPathPrefix, {shouldTrimPathPrefix} = {}) {
  // NOTE: We use `pkgPath` because it lets us navigate to it using iTerm2.
  const nameStr = c.grey(`(${p.name})`)
  // Trim pkg path because its already present in the header text.
  // Downside is that it becomes no longer cmd+click navigable.
  // By not passing `trimPathPrefix`, we can keep it long.
  // `packages/public/foo/package.json` -> `.../foo/package.json`
  const pkgPath = shouldTrimPathPrefix ? p.pkgPath.replace(trimPathPrefix, '...') : p.pkgPath
  // --
  const pkgPathStr = c.cyan(`(${pkgPath})`)
  const itemTitle = p.dirName ? p.dirName : p.name
  const indent = '   '
  // TODO(vjpr): Package name is less useful here.
  let str = ` - ${itemTitle} ${nameStr} ${pkgPathStr}`
  // TODO(vjpr): For app templates, maybe provide the github repo url that its from?
  if (p.description) str += '\n' + indent + c.green('> ' + p.description)
  if (p.repository) {
    str += '\n' + indent + c.grey(`Original: ${getRepoString(p.repository)}`)
  }
  return str
}

function getRepoString(repository) {
  if (!repository) return
  if (_.isString(repository)) return repository
  return repository.url
}

////////////////////////////////////////////////////////////////////////////////

// project - which app will we run the bins in
export function sectionHeaderRepoBinsFromApp(project) {
  return (
    `${c.bold.underline('Repo Bins')} ` +
    c.grey(`live app ${project.dirName} bin <bin-name|package-name>`)
  )
}

export function sectionHeaderPackageBinsFromPackage(project) {
  if (project) {
    return (
      `${c.bold.underline('App Bins')} ` +
      c.grey(`live app ${project.dirName} pkg-bin <bin-name|package-name>`)
    )
  }
}

// `live bin`
export function sectionHeaderRepoBinsFromRepoRoot() {
  return (
    `${c.bold.underline('Repo Bins')} ` +
    c.grey(`live bin <bin-name|package-name>`)
  )
}

export function sectionHeaderStacks(title) {
  return (
    `${c.bold.underline(title)} ` + c.grey(`live stack ${title} (<name>) <command>`)
  )
}

export function sectionHeaderApps(title, packageOrApp = 'app') {
  if (packageOrApp === 'app') {
    return (
      `${c.bold.underline(title)} ` + c.grey('live app <app-name> <command>')
    )
  } else {
    return (
      `${c.bold.underline(title)} ` +
      c.grey('live pkg <package-name> <command>')
    )
  }
}
