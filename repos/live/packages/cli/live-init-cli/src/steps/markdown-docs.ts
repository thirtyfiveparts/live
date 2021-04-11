import glob from 'globby'
import Mustache from 'mustache'
import fse from 'fs-extra'
import path, {join} from 'path'

export default async function markdownDocs(
  {destAbs, isDryRun},
  {pkgName, pkgDescription},
) {
  const data = {
    pkgName,
    pkgDescription,
  }
  const files = glob.sync('**/*.md', {
    cwd: destAbs,
    ignore: ['**/node_modules/**'],
  })

  // Moustache vars are html-escaped by default. We override this.
  // See: https://github.com/janl/mustache.js#variables
  Mustache.escape = text => text

  console.log(destAbs, files)
  for (const file of files) {
    const absFile = join(destAbs, file)
    const contents = fse.readFileSync(absFile, 'utf8')
    const output = Mustache.render(contents, data)
    console.log('Writing', absFile, output)

    if (isDryRun) continue
    fse.writeFileSync(absFile, output)
  }
}
