import Enquirer, {prompt, AutoComplete} from 'enquirer'
import Yargs from 'yargs'
import path, {join} from 'path'
import c from 'chalk'
import cpy from 'cpy'
import _ from 'lodash'
import {spawn, exec} from 'promisify-child-process'
import editJsonFile from 'edit-json-file'
import findProjects from '@live/find-projects'
import fse from 'fs-extra'
import logUpdate from 'log-update'
import {getWorkspacePackages} from '@live/get-workspace-pkgs'
import jsonDiff from 'json-diff'
import glob from 'globby'
//import copy from 'copy'

import validateNpmPackageName from 'validate-npm-package-name'

import npa from 'npm-package-arg'
import markdownDocs from './steps/markdown-docs'

import sortPackageJson from 'sort-package-json'

export default async function () {
  console.log('process.cwd()', process.cwd())
  const repoRoot = findRepoRoot()
  const cwd = process.cwd()

  const yargs = Yargs.alias({dryRun: 'd'}).argv

  // Read config.
  const config = require(path.join(repoRoot, 'live.config.js'))
  config.cliFlags = {}

  //////////////////////////////////////////////////////////////////////////////
  // Read options from cli
  //////////////////////////////////////////////////////////////////////////////

  // Name of the package. E.g. `@org/foo.bar`.
  let newProjectName = yargs._[0]

  // The repo root relative path where the contents of the template will be placed.
  let projectDestFolder = yargs.dest

  // TODO(vjpr):
  // Run a single step for debugging purposes.
  //let step = yargs.step

  let noInstall = yargs.noInstall ?? false

  // Don't actually copy files.
  let isDryRun = yargs.dryRun

  if (isDryRun) {
    console.log('DRY RUN MODE!')
  }

  // DEBUG
  console.log({yargs, isDryRun})

  // E.g. repos/live/packages/apps
  // TODO(vjpr): Find folder closest to where the command was run.
  //   Maybe just cwd.
  const defaultAppFolderDest = _.first(config.appFolders)

  //////////////////////////////////////////////////////////////////////////////
  // Select a template
  //////////////////////////////////////////////////////////////////////////////

  const selectedTemplateProject = await getTemplateProject({config, repoRoot})

  //////////////////////////////////////////////////////////////////////////////
  // Name project
  //////////////////////////////////////////////////////////////////////////////

  if (!newProjectName) {
    newProjectName = await getProjectName({config, cwd})
  }

  //let defaultAppFolderRel = defaultAppFolderDest || config.appFolderDefault
  // TODO(vjpr): Ensure trailing slash instead.
  let repoRelCwd = path.relative(repoRoot, cwd)

  //////////////////////////////////////////////////////////////////////////////
  // Project location
  //////////////////////////////////////////////////////////////////////////////

  let projectDir = await getProjectDestDir({
    repoRoot,
    cwd,
    repoRelCwd,
    projectDestFolder,
    selectedTemplateProject,
    newProjectName,
  })

  //////////////////////////////////////////////////////////////////////////////

  //const newProjectFolderDir = newProjectName
  //const newProjectPackageName = newProjectName
  //const defaultAppFolderAbs = join(repoRoot, appFolder)
  //const relDest = join(appFolder, newProjectFolderDir)
  //const absDest = join(defaultAppFolderAbs, newProjectFolderDir)

  const sourceAbs = selectedTemplateProject.absRoot
  const sourceRepoRel = selectedTemplateProject.root
  const destAbs = join(repoRoot, projectDir)
  const destRepoRel = projectDir

  // TODO(vjpr): Also don't copy `package.json#live.template.exclude` and `.gitignore`.
  //   Also remove `package.json#live.template.exclude` from the `package.json`.

  // Don't copy these files.
  const additionalExcludes =
    selectedTemplateProject.pjsonLiveConfig?.template?.exclude ?? []

  const defaultIgnores = [
    '**/node_modules/**',
    'docs-shared',
    'instructions.md',
  ]

  const ignore = [...defaultIgnores, ...additionalExcludes]

  const sourcePattern = join('**')
  const copyOpts = {
    ignore,
    parents: true,
    cwd: sourceAbs,
    dot: true, // Match dotfiles. https://github.com/mrmlnc/fast-glob#dot
  }

  console.log(`Copying all files from '${sourceRepoRel}' to '${destRepoRel}'`)
  console.log(`Except: [${ignore.join(', ')}]`)

  const fileList = glob.sync(sourcePattern, copyOpts)
  console.log({fileList})

  //////////////////////////////////////////////////////////////////////////////
  // Run steps
  //////////////////////////////////////////////////////////////////////////////

  const step = makeStep({isDryRun})

  ////////////////////

  const sourceCpyPatternRepoRel = path.relative(
    repoRoot,
    join(copyOpts.cwd, sourcePattern),
  )
  await step(
    () => {
      let msg = ''
      msg += `Copying '${sourceCpyPatternRepoRel}' to ${destRepoRel}`
      return msg
    },
    async ({isDryRun}) => {
      if (isDryRun) return
      // NOTE: cpy uses globby internally.
      await cpy(sourcePattern, destAbs, copyOpts).on('progress', prog => {
        logUpdate(prog.percent.toFixed(0) * 100)
        //console.log(prog.percent.toFixed(0) * 100)
      })
      logUpdate.clear()
    },
  )

  ////////////////////

  // TODO(vjpr): Maybe there is no package.json because we are copying a variety of packages...
  //const origPjsonPath = join(sourceAbs, 'package.json')
  //const origPjson = fse.readJsonSync(origPjsonPath)

  // TODO(vjpr): Let's not use edit. Let's edit the file in-memory, diff, and then show it.
  //   Annoying - we already did this many times before in other packages.

  // TODO(vjpr): The template might not have a package.json in its root...it could be a group of folders containing packages that need replacing.

  const pkgDescription = 'TODO'

  const templateRootPjsonPath = join(sourceAbs, 'package.json')
  const psjonDestPath = join(destAbs, 'package.json')
  const pjsonOrig = fse.readJsonSync(templateRootPjsonPath)
  const pjson = fse.readJsonSync(templateRootPjsonPath) // TODO(vjpr): Don't read twice.
  pjson.name = newProjectName
  pjson.version = '0.1.0'
  pjson.description = pkgDescription

  // TODO(vjpr): Maybe the template can control this custom functionality by using the `pjson#live.template` setting.
  if (pjson.bin) {
    const pkgNameWithoutScope = removePkgNameScope(newProjectName)
    const binName = pkgNameWithoutScope
    delete pjson.bin['live-cli-template']
    _.set(pjson, ['bin', binName], 'bin/index.js')
    // TODO(vjpr): Collect todos at the end of the script. Or add them to `instructions.md` or something.
    _.set(pjson, ['binDescription', binName], 'TODO')
  }

  // Remove settings configuring this template.
  _.set(pjson, 'live.template', undefined)
  //pjson['live.app'] = true
  // TODO(vjpr): Show diff.

  const showDiff = true

  await step(
    () => {
      let msg = `Editing package.json\n`
      msg += JSON.stringify(pjson, null, 2)
      if (showDiff) {
        msg += '\n' + jsonDiff.diffString(pjsonOrig, pjson)
      }
      return msg
    },
    async ({isDryRun}) => {
      if (isDryRun) return
      const prettyPjson = sortPackageJson(pjson)
      fse.writeJsonSync(psjonDestPath, prettyPjson, {spaces: 2})
    },
  )

  ////////////////////

  await step(
    () => {
      return 'Update docs'
    },
    async ({isDryRun}) => {
      await markdownDocs(
        {
          destAbs,
          isDryRun,
        },
        {
          pkgName: newProjectName,
          // TODO(vjpr): Sync this with
          pkgDescription,
        },
      )
    },
  )

  ////////////////////

  if (!noInstall) {
    // TODO(vjpr): We can probably do this in an easier way? Maybe use filters.
    const cmd = `pnpm i --prefix=${destRepoRel}` // TODO(vjpr): Print cwd that we use when running this command.
    const spawnOpts = {
      shell: true,
      cwd: repoRoot,
      stdio: 'inherit',
      env: process.env,
    }
    await step(
      () => `Running '${cmd}' ${JSON.stringify({cwd: spawnOpts.cwd}, null, 0)}`,
      async ({isDryRun}) => {
        if (isDryRun) return
        await spawn(cmd, [], spawnOpts)
      },
    )
  }

  console.log('New project created!', destRepoRel)

  console.log(`Run 'live app ${newProjectName}'`)
}

////////////////////////////////////////////////////////////////////////////////

// Handle dry-run.
function makeStep({isDryRun}) {
  return async function step(desc, fn) {
    let msg = desc()
    if (isDryRun) msg = '[dry-run] ' + msg
    console.log(c.cyan(msg))
    await fn({isDryRun})
  }
}

async function getTemplates({config, repoRoot}) {
  //const findProjects = require('ROOT/packages/public-symlink/framework/cli/src/modules/finders/find-projects.js').default
  //const findProjects = require('../../../../../packages/public-symlink/framework/cli/src/modules/finders/find-projects.js')
  //  .default

  // TODO(vjpr): Get `find-project`.
  const cwd = repoRoot

  let projects = await findProjects({config, cwd})
  projects = projects.filter(p => p.isAppTemplate)
  return projects
}

// TODO(vjpr): Reuse this function from cli.
function formatProject(p, trimPathPrefix) {
  // NOTE: We use `pkgPath` because it lets us navigate to it using iTerm2.
  const nameStr = c.grey(`(${p.name})`)
  // TODO(vjpr): Maybe the pkgPath should be relative to the cwd so that cmd+click works?
  const pkgPath = p.pkgPath.replace(trimPathPrefix, '...')
  const pkgPathStr = c.cyan(`(${pkgPath})`)
  // ---
  const itemTitle = p.dirName ? p.dirName : p.name
  // TODO(vjpr): Package name is less useful here.
  return ` - ${itemTitle} ${nameStr} ${pkgPathStr}`
}

function findRepoRoot() {
  const findUp = require('find-up')
  const path = require('path')
  const rootMarkerFile = findUp.sync('pnpm-workspace.yaml')
  if (!rootMarkerFile) return process.cwd()
  return path.dirname(rootMarkerFile)
}

function ensureTrailingSlash(p) {
  if (!p.endsWith('/')) return p + '/'
}

async function ensureUniquePackageNameInRepo(val, {config, cwd}) {
  // TODO(vjpr): Warn if new project name is not unique in the repo.
  // Search all packages.
  let projects = await findProjects({config, cwd})
  const pkg = projects.find(project => project.name === val)
  if (pkg) {
    return {
      valid: false,
      errors: [
        `Package with name '${pkg.name}' already exists at '${pkg.pkgPath}'`,
      ],
    }
  }
  return {valid: true}
}

////////////////////////////////////////////////////////////////////////////////

async function getProjectName({config, cwd}) {
  const resp2 = await prompt({
    type: 'input',
    name: 'name',
    message: 'What do you want to call your package?',
    required: true,
    validate: async val => {
      const res = validateNpmPackageName(val)
      if (res.errors) {
        console.log(res)
        return false
      }
      const {valid, errors} = await ensureUniquePackageNameInRepo(val, {
        config,
        cwd,
      })
      if (!valid) {
        console.error()
        errors.map(e => console.error(c.red(e)))
        return false
      }
      return true
    },
  })
  return resp2.name
}

async function getTemplateProject({config, repoRoot}) {
  const templates = await getTemplates({config, repoRoot})

  const templateChoices = templates.map(project => {
    return {
      //name: project.name,
      message: formatProject(project, repoRoot),
      value: project,
    }
  })

  const p = new AutoComplete({
    name: 'template',
    message: 'Select a template',
    // Rendered to screen after selection is made.
    format: input => input.name,
    // TODO(vjpr): Must not be empty array.
    choices: templateChoices,
    // --
    highlight: c.bold,
    // Customize rendered stuff.
    //suggest: (input, choices) => {},
  })

  return await p.run()
}

async function getProjectDestDir({
  repoRoot,
  cwd,
  repoRelCwd,
  projectDestFolder,
  selectedTemplateProject,
  newProjectName,
}) {
  //const parsedNewProjectName = npa(newProjectName)
  const pkgNameWithoutScope = removePkgNameScope(newProjectName)
  let placeholderDest = (() => {
    if (repoRoot !== cwd) {
      // If we are not in the repo root, use the current directory as the placeholder.
      // E.g. `repos/live/apps/`
      return join(repoRelCwd, pkgNameWithoutScope)
    } else {
      // If we are in the repo root, we use the closest.
      // E.g. `repos/live/foo-bar`
      //
      return join(
        selectedTemplateProject.repoContainingDir,
        pkgNameWithoutScope,
      )
    }
  })()

  // TODO(vjpr): Maybe provide a prompt asking which repo they want to put it in.
  let msg = c.bold(`\nWhere do you want to save your project \n`)
  msg += `NOTE: 'package.json' will be created inside this dir / relative to repo root / press 'tab' to select auto-complete default path?`
  console.log(msg)
  if (!projectDestFolder) {
    const resp = await prompt({
      type: 'input',
      name: 'name',
      message: 'Enter destination',
      initial: placeholderDest,
    })
    return resp.name
  }
}

function removePkgNameScope(pkgName) {
  const parts = pkgName.split('/')
  if (parts.length === 2) {
    return parts[1]
  }
  return parts[0]
}
