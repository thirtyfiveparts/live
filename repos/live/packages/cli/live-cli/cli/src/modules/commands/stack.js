import findProjects from '@live/find-projects'
import {
  printSortedByContainingDir,
  formatProject,
  sectionHeaderStacks,
} from '@live/cli-core/src/printers'
import c from 'chalk'
import {processManager} from '../process-manager'
import Stack from '../stack/stack'

export async function handleStackCommand({pargv, config, cwd, repoRoot}) {
  let str = ''
  str += 'Live Stacks' + '\n'
  str +=
    c.grey(
      'A stack is a name identifying a set a processes required to run an app.',
    ) + '\n'
  str +=
    c.grey(
      'A package can belong to one or more stacks by adding the stack name to `live.stacks` in its `package.json` file.',
    ) + '\n'
  console.log(str)

  const stacks = await findStacks({config, cwd, repoRoot})

  const firstArg = pargv[0]

  if (!firstArg) {
    let msg = ''
    msg += 'Commands:\n\n'
    msg += `ls - List available stacks\n`
    msg += `ps - List running stacks\n`
    console.log(msg)
  }

  // TODO(vjpr): Prevent stacks named as reserved words.
  if (firstArg === 'ls') {
    await printStacks(stacks)
    return
  }

  if (firstArg === 'ps') {
    await showRunningStacks(stacks)
    return
  }

  // Otherwise, `firstArg` is a stack name.
  const selectedStackName = firstArg

  if (!selectedStackName) {
    console.error('You must provide a stack name')
    console.error('TODO: Show help.')
    return
  }

  const stack = stacks[selectedStackName]
  if (!stack) {
    throw new Error(`Stack '${selectedStackName}' not found`)
  }

  const cmd = pargv[1]

  if (!cmd) {
    return stackHelp(selectedStackName)
  }

  const commands = {
    up: async () => {
      // TODO(vjpr): Pull from `--name`.
      const instanceName = 'default'
      await stack.up({instanceName})
    },
    logs: async () => {
      await stack.logs()
    },
  }

  await commands[cmd]()
}

function stackHelp(selectedStack) {
  // Show help for stack instance.
  let msg = ''
  msg += `live stack ${selectedStack} <command>\n`
  msg += '\n'
  msg += 'Commands:\n\n'
  msg += `up - Start stack\n`
  msg += `logs - Start another instance of a stack\n`
  msg += '\n'
  msg += `Flags:\n\n`
  msg += `--name=foo - Instance name. Allows you to run multiple instances of the same stack.\n`
  msg += '\n'
  console.log(msg)
}

async function findStacks({config, cwd, repoRoot}) {
  const projects = await findProjects({config, cwd: repoRoot})

  const stacks = {}
  projects.forEach(p => {
    p.pjsonLiveConfig?.stacks?.map(s => {
      if (!stacks[s]) stacks[s] = new Stack(s, repoRoot)
      stacks[s].addProject(p)
    })
  })

  return stacks
}

async function showRunningStacks(stacks) {
  console.log('Running stacks:\n')

  const processes = stacks.sidekick

  const runningStacks = [
    {
      name: 'sidekick',
      instance: 'default',
      processes,
    },
  ]

  for (const stack of runningStacks) {
    console.log(`${c.bold.underline(stack.name)} - ${stack.instance}`)
    console.log()
    for (const proc of stack.processes) {
      const status = c.green('running')
      console.log(`${proc.name} ${status}`)
    }
  }


}

async function printStacks(stacks) {
  console.log('Available stacks:\n')

  for (const stackEntry of Object.entries(stacks)) {
    const [stackName, stack] = stackEntry
    const {projects} = stack
    console.log(sectionHeaderStacks(stackName))
    printSortedByContainingDir(formatProject, projects, 'repoContainingDir')
    console.log()
    console.log('  TODO: Show stack commands')
    console.log()
  }
}

////////////////////////////////////////////////////////////////////////////////

// Idea: Other ways of defining stacks

// Stacks can be one project nested inside another (implicit by nesting).
// E.g. monorepo-docs + monorepo-docs/server

// Stacks could be determined by name monorepo-docs.server / monorepo-docs.client.

// Or stacks could be defined in a central file or Stackfile or something?

// You could run multiple stacks for each worktree. The same stack could run for a different configuration. Need the ability to name stacks or use a default.
// Provide a way to identify them. Maybe take some inspiration from circleci's config file. Orbs, workflows, jobs.

// Or create a new package that represents a stack.
