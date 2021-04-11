import glob from 'globby'
import path, {join} from 'path'
import fse from 'fs-extra'
import Table from 'cli-table'
import c from 'chalk'
import extractPackageDescFromMarkdown
  from '@src/extract-package-desc-from-markdown'

export default async function () {
  const cwd = process.cwd()

  const dirs = glob.sync('*', {
    cwd,
    onlyDirectories: true,
    objectMode: true,
  })

  const table = new Table({
    head: ['name', 'comment'],
    colWidths: [30, 110],
  })

  for (const dir of dirs) {
    const absDirPath = join(cwd, dir.path)
    const pjsonPath = join(absDirPath, 'package.json')
    const pjson = fse.readJsonSync(pjsonPath, {throws: false})
    const readmes = glob.sync('readme*', {cwd: absDirPath})

    let comment
    if (readmes.length) {
      const readme = readmes[0]
      const readmePath = join(absDirPath, readme)
      const readmeContents = fse.readFileSync(readmePath, 'utf8')
      const {desc, frontmatter} = await extractPackageDescFromMarkdown(readmeContents)
      comment = desc ?? ''
    } else {
      comment = ''
    }

    table.push([dir.name, comment])
  }

  console.log(table.toString())
}
