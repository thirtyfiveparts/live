import path, {join} from 'path'
import c from 'chalk'
import fs from 'fs'
import gitDiff from 'git-diff'
import util from 'util'
import cpy from 'cpy'
import cpFile from 'cp-file'
import del from 'del'
import glob from 'globby'
import _ from 'lodash'
import diff from 'diff'
import dirCompare from 'dir-compare'
import isSymlink from 'is-symlink'
import enquirer from 'enquirer'
import fse from 'fs-extra'
import t from 'tildify'

const readFile = util.promisify(fs.readFile)
const isDir = (f) => fs.existsSync(f) && fse.lstatSync(f).isDirectory()

export default async function ({
  diffSet,
  srcDir,
  destDir,
  dryRun,
  interactive,
  isShowDiff,
}) {
  printLegend()

  for (const d of diffSet) {
    //console.log(d)
    if (!d) return
    await process(d)
  }

  //////////////////////////////////////////////////////////////////////////////

  async function process(d) {
    const fullPathSrc = d.name1 ? join(d.path1, d.name1) : null
    const fullPathDest = d.name2 ? join(d.path2, d.name2) : null

    if (d.state === 'distinct') {
      logFile(c.white(d.name1))

      if (d.type1 === 'directory') {
        //console.log(`We don't create/update bare dirs. We will only copy files.`)
        // If we compare two dirs and they are different, it will be the files inside that are different, so we only care about them.
        return
      }

      await printDiff({fullPathSrc, fullPathDest})
      await updateFile(fullPathSrc, fullPathDest)
    } else if (d.state === 'equal') {
      if (d.type1 === 'directory') {
        // TODO(vjpr): Should we show dirs if they are equal?
      }
      logFile(c.green(d.name1))
    } else if (d.state === 'left') {
      if (d.type1 === 'directory') {
        if (isSymlink.sync(fullPathSrc)) {
          logFile(c.yellow(d.name1 + ' (symlinked dir)'))
          await createFile(fullPathSrc, join(d.path2, d.name1))
          return
        } else {
          // Skip dirs unless they are symlinks.
          return
        }
      } else if (d.type2 === 'missing') {
        logFile(c.cyan(d.name1 + ' (new)'))
        await createFile(fullPathSrc, join(d.path2, d.name1))
      } else {
        logFile(c.yellow(d.name1))
        await updateFile(fullPathSrc, fullPathDest)
      }
    } else if (d.state === 'right') {
      if (d.type1 === 'missing') {
        logFile(c.red(d.name2 + ' (will be deleted)'))
        await delFile(fullPathDest)
      } else {
        logFile(
          c.yellow(d.name2) +
            ' (newer in dest - will be overwritten with older from src)',
        )
        await updateFile(fullPathSrc, fullPathDest)
      }
    } else {
      console.log(d)
    }
  }

  //////////////////////////////////////////////////////////////////////////////

  async function printDiff({fullPathSrc, fullPathDest}) {
    const srcFileContents = await readFile(fullPathSrc, 'utf8')
    const destFileContents = await readFile(fullPathDest, 'utf8')
    const contentDiff = await gitDiff(destFileContents, srcFileContents, {
      color: true,
      noHeaders: true,
    })

    // a. Show cmd to do a intellij diff.
    // Shell scripts for IntelliJ are generated by JetBrain Toolbox.
    //   https://www.jetbrains.com/help/idea/working-with-the-ide-features-from-command-line.html#toolbox
    const cmd = c.grey(`$ idea diff ${fullPathSrc} ${fullPathDest}`)
    console.log(cmd)

    // b. Show full paths to allow cmd+click from iTerm.
    //console.log(c.grey(fullPathSrc))
    //console.log(c.grey(fullPathDest))

    // c. Show a diff
    if (isShowDiff) {
      console.log()
      console.log(contentDiff)
      console.log()
    }
  }

  //////////////////////////////////////////////////////////////////////////////

  async function confirm(msg) {
    // TODO(vjpr): Show msg.
    if (!interactive) return true
    const prompt = new Confirm({
      name: 'yes',
      message: 'Do you want to continue?',
    })
    const res = await prompt.run()
    console.log(res)
    return res.yes
  }

  function log(str) {
    console.log(str)
  }

  function logFile(str) {
    console.log('-'.repeat(80))
    console.log(str)
  }

  function prefixDryRun(msg) {
    console.log('[dry-run]\n' + msg)
  }

  async function createFile(p1, p2) {
    // TODO(vjpr): Must set mtime to be same as old.
    let msg = `From: ${t(p1)}\nTo: ${t(p2)}`
    if (dryRun) return prefixDryRun(msg)
    console.log(msg)
    if (!(await confirm(msg))) return
    await fse.copy(p1, p2, {preserveTimestamps: true})
  }

  async function updateFile(p1, p2) {
    const msg = `Updating ${p1} -> ${p2}`
    if (dryRun) return prefixDryRun(msg)
    console.log(msg)
    if (!(await confirm(msg))) return

    //if (isSymlink(p1)) {
    //  fs.copySync(p1, p2)
    //}

    // TODO(vjpr): Copying a symlink over another symlink causes issues.
    // https://github.com/jprichardson/node-fs-extra/issues/544#issuecomment-502803197
    //await fse.copy(p1, p2, {
    //  overwrite: true,
    //  // TODO(vjpr): Should we use this?
    //  preserveTimestamps: true,
    //})
    //////////////////////

    const stat = fs.statSync(p1)
    fs.copyFileSync(p1, p2)
    fs.utimesSync(p2, stat.atime, stat.mtime)
  }

  async function delFile(p) {
    const msg = `Deleting ${p}`
    if (dryRun) return
    if (!(await confirm(msg))) return
    await del(p, {force: true})
  }
}

function printLegend() {
  let msg = ''
  msg += `Legend: ${c.green('green')} = identical`
  msg += `, ${c.cyan('cyan')} = needs update`

  console.log(msg)
  console.log()
}
