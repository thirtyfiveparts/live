import ejs from 'ejs'
import path, {join} from 'path'
import c from 'chalk'
import fse from 'fs-extra'
import matter from 'gray-matter'
import readPkg from 'read-pkg'
import prettier from 'prettier'
import dedent from 'dedent'
import resolveFrom from 'resolve-from'
import tsdocGenerator, {
  generateReadmeSimple,
  runExtract
} from '@live/tsdoc-generator'

export default async function ({pkgDir}) {
  const readmeTemplatePath = join(pkgDir, 'readme.template.md')
  const readmeTemplateContents = fse.readFileSync(readmeTemplatePath, 'utf8')
  const readmePath = join(pkgDir, 'readme.md')
  const readmePartialsDir = join(pkgDir, 'docs/_readme')
  const readmeExamplesPath = readmePartialsDir
  //const readmeExamplesPath = join(pkgDir, 'examples/_readme')

  const pkgPath = join(pkgDir, 'package.json')
  const pkg = readPkg.sync(pkgPath)

  const config = {
    pkg,
    description: 'This is a package',
    subDescription: 'Bla blah blah',
  }

  const standardTheme = {
    title: {
      type: 'plain',
    },
    description: {
      type: 'plain',
      prefix: '',
    },
  }

  const centeredTheme = {
    title: {
      type: 'centered',
    },
    description: {
      type: 'centered',
      prefix: '> ',
    },
  }

  const theme = standardTheme

  const docusaurusFrontmatter = {
    hide_title: true,
  }

  const ejsOpts = {
    async: true
  }

  // `filename` - Currently rendering filename.
  //   We use this for
  const makeOpts = ({filename}) => {
    return {
      async: true,
      template: {
        shields: {
          // See https://nodei.co/, https://shields.io/, https://github.com/dwyl/repo-badges
        },
        frontmatter: matter.stringify('', docusaurusFrontmatter).trim() + '\n',
        title: wrap(title(config, theme)),
        description: wrap(description(config, theme)),
        install: wrap(install(config, theme)),
        usage: wrap(usage()),
        include: async file => {
          const filename = join(readmePartialsDir, ensureMdExtension(file))
          const contents = fse.readFileSync(filename, 'utf8')
          const opts = makeOpts({filename})
          const rendered = await ejs.render(contents, opts, ejsOpts)
          return rendered
        },
        code: (file, opts) => {
          const {lineStart, lineEnd} = opts ?? {}
          // Relative to markdown.
          let p = resolveFrom(path.dirname(filename), file)
          const contents = fse.readFileSync(p, 'utf8')
          if (!lineStart) codeBlock(contents)
          let lines = contents.split('\n')
          lines = lines.slice(lineStart, lineEnd).join('\n')
          return codeBlock(lines)
        },
        // Use `api-extractor` to generate some docs.
        api: async () => {
          // TODO(vjpr): Run once...maybe we should put the caching inside this package.
          //runExtract({pkgDir})
          const contents = await generateReadmeSimple({pkgDir})
          return contents
        },
      },
    }
  }

  const opts = makeOpts({filename: readmePath})

  const rendered = await ejs.render(readmeTemplateContents, opts, ejsOpts)

  console.log({rendered})

  console.log(c.cyan('Writing: ' + readmePath))
  fse.writeFileSync(readmePath, rendered)
}

////////////////////////////////////////////////////////////////////////////////

//function resolveFile() {
//  // --
//  //if (filename.startsWith('.')) {
//  //  p = join(path.dirname(filename), file)
//  //} else {
//  //  // TODO(vjpr): Should we use `resolveFrom`?
//  //  p = join(pkgDir, file)
//  //}
//  // --
//  //const p = join(readmeExamplesPath, file)
//}

function codeBlock(code, dialect = 'typescript') {
  return '```' + dialect + '\n' + code + '```'
}

function install({pkg}, theme) {
  return dedent`
    ## Install
    
    ${'```'}
    pnpm add ${pkg.name}
    ${'```'}
    `
}

function title({pkg}, theme) {
  if (theme.title.type === 'centered') {
    return `<h1 align="center">${pkg.name}</h1>`
  }
  return '# ' + pkg.name
}

function description({description, subDescription}, theme) {
  if (theme.description.type === 'centered') {
    const html = dedent`
    <p align="center">
      <b>${description}</b><br>
      <sub>${subDescription}</sub>
    </p>
  `
    return htmlPretty(html)
  }
  return (theme.description.prefix ?? '') + description
}

function usage() {
  return `# Usage`
}

////////////////////////////////////////////////////////////////////////////////

function htmlPretty(contents) {
  return prettier.format(contents, {parser: 'html'})
}

function markdownPretty(contents) {
  return prettier.format(contents, {parser: 'markdown'})
}

function wrap(contents) {
  return contents + '\n'
}

function ensureMdExtension(p) {
  if (!p.endsWith('.md')) {
    return p + '.md'
  }
  return p
}
