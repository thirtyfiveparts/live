import exit from 'exit'
import fse from 'fs-extra'
import cheerio from 'cheerio'
import fs from 'fs'
import Debug from 'debug'
import hasChanges from '@src/modules/has-changes'
import chalk from 'chalk'
import * as jsdiff from 'diff'
import {pd} from 'pretty-data'

const debug = Debug('jetbrains-project')

export default async function updateExcludes({cwd, imlFile, newExcludes, dryRun}) {
  const imlContents = fse.readFileSync(imlFile, {encoding: 'utf8'})
  const $ = cheerio.load(imlContents, {xmlMode: true})

  let mainContentEl = (() => {
    const el = $('module > component > content').filter((i, el) => {
      return $(el).attr('url') === 'file://$MODULE_DIR$'
    })
    if (!el) {
      console.error('`module > component > content` not found in:', imlFile)
      exit()
    }
    return el
  })()

  let existingExcludes = (() => {
    const excludes = mainContentEl.children('excludeFolder')
    return excludes.toArray().map(v => {
      let {url} = v.attribs
      url = url.replace('file://$MODULE_DIR$/', '')
      return url
    })
  })()

  // We need to leave the `excludePatterns` which we set in `Project Structure > Modules > Sources > Exclude files`.
  // i.e. `<excludePattern pattern="node_modules" />`

  // We used to do this:
  //mainContentEl[0].children = []

  const res = $(mainContentEl).find('excludeFolder').remove()

  //console.log(res.length, 'elements removed')
  //console.log($.html(mainContentEl)) // DEBUG

  newExcludes = newExcludes.map(url => {
    url = `file://$MODULE_DIR$/${url}`
    return $('<excludeFolder/>').attr({url})
  })
  // NOTE: We prepend because we want excludePatterns to go at the end to reduce churn.
  //   IDE will add new excludePatterns will be added to end.
  mainContentEl.prepend(newExcludes)

  const xml = $.xml()
  const prettyXML = pd.xml(xml)

  const changed = hasChanges(imlContents, prettyXML)

  if (changed) {
    printTextDiff(imlContents, prettyXML)
    if (!dryRun) {
      console.log('Writing', imlFile)
      fs.writeFileSync(imlFile, prettyXML)
    } else {
      console.log('Skipping writing (because --dry-run)', imlFile)
    }
  } else {
    console.log('Up to date.')
  }
}

function printTextDiff(a, b) {
  let out = ''
  out += '------------------\n'
  const diff = jsdiff.diffLines(a, b)

  if (!hasChanges(a, b)) {
    out += 'Changes: No changes.'
    console.log(out)
    return false
  }

  out += '\n'
  // TODO(vjpr): Compact blocks of no changes.
  diff.forEach(part => {
    // green for additions, red for deletions
    // grey for common parts
    const color = part.added ? 'green' : part.removed ? 'red' : 'grey'
    out += chalk[color](part.value)
  })

  out += '\n------------------\n'

  console.log(out)
}
