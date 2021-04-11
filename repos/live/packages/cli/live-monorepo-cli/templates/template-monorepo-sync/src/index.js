import {dirname, join} from 'path'
import {fileURLToPath} from 'url'
import glob from 'globby'
import del from 'del'
import cpy from 'cpy'
import syncRootFiles from './root.js'
import tildify from 'tildify'
import t from 'tildify'
import c from 'chalk'
import paths from './paths.js'
import fse from 'fs-extra'

main().then()

export default async function main() {
  //const __dirname = dirname(fileURLToPath(import.meta.url))

  //const from = join(__dirname, '../../../../../../../..')
  const from = getRepoRoot()

  const to = join(__dirname, paths.templateMonorepoFiles) // `../template-monorepo-files`

  console.log()
  console.log(`Syncing ${t(from)} -> ${t(to)}`)
  console.log()

  await clearDir(to)

  await syncRootFiles({from, to})

  await configToolsDirStage({from, destDir: to})
}

// TODO(vjpr): Add more safety.
async function clearDir(dir) {
  console.log(`Erasing everything in ${t(dir)}`)
  console.log()
  if (dir === '' || !dir) {
    console.error('Could not delete dir')
  }
  const deleted = await del(dir + '/**', {
    dryRun: false,
    dot: true,
    force: true,
  })
  for (const file of deleted) {
    console.log(c.red(`- ${t(file)}`))
  }
  console.log()
  return deleted
}

// TODO(vjpr): Manual tool settings.
//   Setup webstorm tooling setting by modifying the IntelliJ config.
//   Similar to getting changelists. Use `jetbrains-project`.

async function configToolsDirStage({from, destDir}) {
  console.log(`Copying tools/** -> ${code(tildify(destDir))}`)
  console.log()

  // We set `cwd` to the tools dir because we want to copy the dir structure within the tools dir.
  const cwd = join(from, paths.toolsDir) // `path/to/root/tools/`
  const destToolsDir = join(destDir, paths.toolsDir)

  const files = await glob('**', {
    cwd,
    dot: true,
    ignore: ['**/node_modules/**'],
  })

  // Only copy `.default.js` files (which will be renamed with `.default.js`).
  for (const file of files) {
    //(
    // Copy `default` dir contents to tool dir.
    // e.g. `eslint/default`
    const fileParts = file.split('/') // TODO: Windows compat.
    if (fileParts[1] === 'default') {
      const toolName = fileParts[0]
      const defaultFolder = join(cwd, toolName, 'default') // e.g. /path/to/tools/eslint/default
      const defaultFolderRelPath = fileParts.slice(2).join('')
      const destToolDir = join(destToolsDir, toolName)
      //console.log({toolName, defaultFolder, defaultFolderRelPath, destToolDir})
      await cpy(defaultFolderRelPath, destToolDir, {
        parents: true,
        cwd: defaultFolder,
        rename: (basename) => {
          return basename.replace('.default', '')
        },
      })

      // TODO(vjpr): We don't need to do this, we should make sure any package.json files are manually maintained as defaults.
      //   This should just be used as a warning.
      // TODO(vjpr): Handle `package.json`s individually. We need to remove any `workspace:^0.1.0` references.
      //if (file.endsWith('package.json')) {
      //  const pjsonPath = join(cwd, file)
      //  const pjson = fse.readJsonSync(pjsonPath)
      //  for (const [k, v] of Object.entries(pjson.dependencies)) {
      //    pjson.dependencies[k] = v.replace('workspace:', '')
      //  }
      //  console.log(pjsonPath, pjson)
      //  //fse.writeJsonSync(destToolsDir, pjson)
      //}

      continue
    }

    // TODO(vjpr): Make this conditional easier to read.
    // Skip files that don't end in `.default` except `package.json`.
    if (file.endsWith('.default.js')) {
      console.log(c.green(`+ ${file}`))

      //console.log({cwd, file, destToolsDir})

      // TODO(vjpr): We should use `basename` function instead of `destFileName`.
      await cpy(file, destToolsDir, {
        parents: true,
        cwd,
        rename: (basename) => {
          return basename.replace('.default', '')
        },
      })
      continue
    }

    // tools/package.json
    // TODO(vjpr): Use `package.default.json` instead.
    if (file === 'package.json') {
      const toolsPackageJson = toolPackageJsonContents()
      console.log('Writing tools/package.json:', join(destToolsDir, file))

      const toolsPackageJsonPath = join(destToolsDir, file)
      fse.ensureFileSync(toolsPackageJsonPath)
      fse.writeJsonSync(toolsPackageJsonPath, toolsPackageJson)
      continue
    }

    // OUT-DATED
    // Rename any `package.json` files to something unique.
    // We will just ignore using `pnpm-workspace.yaml`.

    //if (file.endsWith('package.json')) {
    //  const pjson = fse.readJsonSync(join(cwd, file))
    //  console.log({pjson})
    //
    //  //const pjson = fse.readJsonSync(file)
    //  //const oldName = pjson.name
    //  //const newName = pjson.name + '-template'
    //  //console.log(c.cyan(`Changing package name from ${oldName} to ${newName}`))
    //  //fse.writeJsonSync(toolsPackageJsonPath, toolsPackageJson)
    //}

    // Custom config - don't copy.

    console.log(c.grey(`o ${file} (custom config - not copying)`))
  }
}

//
//
//}

function code(str) {
  return `${str}`
}

// TODO(vjpr): We want to migrate to `tools/package.default.json` instead I think.
// We don't use .default for root config files because it makes the root dir a mess and we redirect them to tools instead where we can keep .default files alongside.
function toolPackageJsonContents() {
  return {
    name: '@org-private/tools',
    version: '0.1.0',
    dependencies: {
      '@live/ava-config': '^0.1.0',
      '@live/babel-root-config': '^0.0.1',
      '@live/commitlint-config': '^0.1.0',
      '@live/eslint-config-monorepo': '^0.1.0',
      '@live/husky-config': '^0.1.0',
      '@live/jest-config': '^0.1.0',
      '@live/lint-staged-config': '^0.1.0',
      '@live/markdownlint-config': '^0.1.0',
      '@live/prettier-config': '^0.1.0',
      '@live/wallaby-config': '^0.1.0',
      '@live/webstorm-webpack-config': '^0.1.0',
    },
  }
}

function getRepoRoot() {
  const findUp = require('find-up')
  const path = require('path')
  const rootPath = findUp.sync('pnpm-workspace.yaml', {cwd: process.cwd()})
  const repoRoot = path.dirname(rootPath)
  return repoRoot
}
