// TODO(vjpr): To speed this up we should restrict our search to the correct app type dirs.
import * as changeCase from 'change-case'
import findProjects from './find-projects'
import _ from 'lodash'
import {collectCommands} from '@live/cli-core/src/livefile'

export default findProjects

// We search for commands as follows:
// - Local package livefile
// - Repo root livefile
//   - `appType`
//   - `app`
//   - `package`
// - Built-in commands...
// TODO(vjpr): Maybe we want to have "package group" commands? Using a findup?
//   Maybe a bad idea. Get's messy. Rather use composition. But would support multiple package repos.
export async function resolveCmd({project, cmd, repoRoot, ctx}) {
  // pjson#live.appType (e.g. 'live-next-js')
  const appType = changeCase.pascalCase(project.pjsonLiveConfig?.appType ?? '')

  const commands = collectCommands({project, repoRoot, ctx})

  // We filter instead of find because cmd could have same name but different source/app-type/features.
  let resolvedCmds = _.filter(commands, c => {
    // Commands can have aliases. E.g. fooBar -> foo-bar.
    return c.name === cmd || c.nameAliases?.includes(cmd)
  })

  // Filter by app type only if the command is for a specific appType.
  resolvedCmds = _.filter(resolvedCmds, cmd => {
    if (cmd.commandType.startsWith('appType')) {
      const cmdAppType = cmd.commandType.replace('appType', '')
      if (cmdAppType === appType) {
        // App type commands get higher priority.
        cmd.source.priority = cmd.source.priority * 10
        return true
      }
      return false
    }
    return true
  })

  if (!resolvedCmds.length) return {}

  if (resolvedCmds.length === 1) return _.first(resolvedCmds)

  if (resolvedCmds.length > 1) {
    // We must prioritize which command to run.
    let sorted = _.sortBy(resolvedCmds, 'source.priority')
    sorted = sorted.reverse() // Highest priority should be first.
    //console.log(sorted.map(c => [c, c.source]))
    return _.first(sorted)
  }

  // TODO(vjpr): Should we have commandType=top-level override others?

  // TODO(vjpr): We should provide option to print the resolution process.
  //   Explain why matching commands are skipped over.
  //   This same resolution process should be incorporated in the help print.

  return {}
}

export function findBin(projects, targetBinName) {
  return _(projects)
    .map(project => {
      const binPath = _(project.bins).find((file, binName) => {
        return binName === targetBinName
      })
      if (binPath) {
        return {project, binPath}
      }
    })
    .filter(Boolean)
    .first()
}

// TODO(vjpr): Rename to `findProjectBySelector`.
//   Maybe we should use pnpm's package filters with globs and such.
// Find by containing dir name, and if no results find by package name.
export async function findProjectByName(name, config) {
  if (!name) return // Otherwise it would match against a non app project.
  const projects = await findProjects({config, cwd: process.cwd()}) // check cwd

  // Find by dir name.
  //   <repo>.<dir-name-within-app-dir>
  //   repos/live/packages/apps/docs
  //   => live app live.docs

  const nameParts = name.split('.')

  {
    let matchingProjects
    if (nameParts.length === 1) {
      matchingProjects = _.filter(projects, {dirName: name})
    } else {
      matchingProjects = _.filter(projects, {
        repoContainingDirName: nameParts[0],
        dirName: nameParts[1],
      })
    }
    const res = filterApps(matchingProjects)
    if (res) return res
  }

  // Find by package name.

  {
    let matchingProjects = _.filter(projects, {name})
    const res = filterApps(matchingProjects)
    if (res) return res
  }
}

// TODO(vjpr): Suggest using `repo.docs` instead of just `docs`.
// Filter list of matching projects that are apps, and handle multiple matches.
function filterApps(filteredProjects) {
  if (filteredProjects.length > 1) {
    filteredProjects = filteredProjects.filter(
      project => project.pjsonLiveConfig?.app,
    )
    if (filteredProjects.length === 0) {
      console.warn(
        `Multiple projects found, but none had 'live.app' set to 'true'.`,
      )
      return
    }
  }
  if (filteredProjects.length > 1) {
    // TODO(vjpr): This will happen if we have
    //   `apps/xxx/packages/app/package.json` and
    //   `apps/xxx/package.json`. See `findProjects`.
    console.warn('Multiple projects found. Will use first.')
    return _.first(filteredProjects)
  }
  return _.first(filteredProjects)
}
