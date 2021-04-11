import {join} from 'path'
import glob from 'globby'
import _ from 'lodash'
import fse from 'fs-extra'
import c from 'chalk'
import t from 'tildify'
import paths from './paths.js'

export default async function syncRootFiles({from, to}) {
  console.log(`Copying root files from ${t(from)} -> ${t(to)}`)
  console.log()

  //////////////////////////////////////////////////////////////////////////////
  // package.json
  //////////////////////////////////////////////////////////////////////////////

  const pjson = {
    name: '@org/monorepo',
    description: 'Monorepo bootstrapped by Live',
    version: '0.1.0',
    scripts: {
      test: 'ava',
      'test:ava': 'ava',
      'test:jest': 'jest',
      'lint:mdlint':
        'markdownlint -c config/tools/markdownlint/markdownlint.config.js',
      'lint:eslint':
        './node_modules/config/tools/node_modules/@live/eslint-config/scripts/eslint.sh',
      'lint:eslint:fix':
        './node_modules/config/tools/node_modules/@live/eslint-config/scripts/eslint-fix.sh',
      'lint:ts': 'tsc -p tsconfig.json --noEmit',
      'lint:docs': 'npx markdownlint README.md',
      format: "prettier --write '**/*.{ts,js}'",
      'commitlint-cli': './node_modules/.bin/commit',
      'template-monorepo-sync':
        'pnpm exec --filter @live/template-monorepo-sync node .',
      preinstall: 'npx only-allow pnpm',
      'delete-node-modules': 'pnpm -r exec -- rm -rf node_modules || false',
      'delete-lib': 'pnpm -r exec -- rm -rf lib || false',
      'wallaby:write-env': 'echo "WALLABY_OPTS=$@" > tmp/wallaby.env',
    },
    dependencies: {
      '@babel/core': '^7.10.2',
      //'@live/cli': '^0.0.0',
      '@live/tsconfig': '^0.1.0',
      'jest-config': '^26.0.1',
    },
    devDependencies: {
      '@ava/babel': '^1.0.1',
      '@babel/preset-env': '^7.10.2',
      '@commitlint/prompt-cli': '^8.3.5',
      '@jest/core': '^26.0.1',
      '@types/jest': '^25.2.3',
      ava: '^3.8.2',
      'babel-jest': '^26.0.1',
      commitlint: '^8.3.5',
      eslint: '^7.1.0',
      husky: '^4.2.5',
      jest: '^26.0.1',
      'jest-util': '^26.0.1',
      'lint-staged': '^10.2.9',
      'markdownlint-cli': '^0.23.1',
      'only-allow': '^1.0.0',
      prettier: '^2.0.5',
      'regenerator-runtime': '^0.13.5',
      'ts-node': '^8.10.2',
      typescript: '^3.9.3',
    },
  }

  //////////////////////////////////////////////////////////////////////////////
  // package.json.md
  //////////////////////////////////////////////////////////////////////////////

  const pjsonNotesMd = `
# \`package.json\` notes

> Notes on dependencies.
`

  //////////////////////////////////////////////////////////////////////////////
  // readme.md
  //////////////////////////////////////////////////////////////////////////////

  const readmeMd = `
# Monorepo

See [config/docs/readme](config/docs/readme.md)
`

  //////////////////////////////////////////////////////////////////////////////
  // tsconfig.json
  //////////////////////////////////////////////////////////////////////////////

  const tsconfigMd = `
Documentation about the \`tsconfig.json\` file.
`

  //////////////////////////////////////////////////////////////////////////////
  // .codeclimate.yml
  //////////////////////////////////////////////////////////////////////////////

  const codeclimateYml = `
languages:
  JavaScript: true

plugins:
  markdownlint:
    enabled: true
  eslint:
    enabled: true
    config: .eslintrc.js
    extensions:
    - .es6
    - .js
    - .jsx
    - .ts
    - .tsx
    - .mjs

exclude_patterns:
  - "**/node_modules/"
`

  //////////////////////////////////////////////////////////////////////////////
  //

  const gitattributes = `
# Convert text file line endings to lf
* text=auto

*.js text eol=lf
`

  //////////////////////////////////////////////////////////////////////////////
  // .gitignore
  //////////////////////////////////////////////////////////////////////////////

  const gitignore = `
node_modules
.dev
.idea  
`

  //////////////////////////////////////////////////////////////////////////////
  // codecov.yml
  //////////////////////////////////////////////////////////////////////////////

  const codecovYml = `
parsers:
  javascript:
    enable_partials: yes
`

  //////////////////////////////////////////////////////////////////////////////
  // pnpm-workspace.yaml
  //////////////////////////////////////////////////////////////////////////////

  const pnpmWorkspaceYaml = `
packages:
  - '.'
  - 'tools/**'
  - 'repos/**'
  # If we use a custom \`modules-dir\` for testing with pnpm we must ignore them when looking for packages.
  - '!**/node_modules_public/**'
  - '!**/template-monorepo-files'
  # Filter original packages.
  - '!**/app-templates/*-orig/**'
  - '!**/.linked'
`

  //////////////////////////////////////////////////////////////////////////////
  // LICENSE.md
  //////////////////////////////////////////////////////////////////////////////

  const licenseMd = `
Copyright <YEAR> <COPYRIGHT HOLDER>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
`

  //////////////////////////////////////////////////////////////////////////////
  // tsconfig.json
  //////////////////////////////////////////////////////////////////////////////

  const tsconfigJson = `
{
  // NOTE: Without this default imports break when running tests in packages.
  "extends": "./node_modules/@live/tsconfig/tsconfig.base.json",
  // --

  // Don't compile any files in root package.
  "files": [],
  // --

  "exclude": ["node_modules"],
  "references": []
}
`

  //////////////////////////////////////////////////////////////////////////////

  //function moduleExportsRequire(path) {
  //  return `module.exports = require('${path}')`
  //}

  function moduleExportsRequireTools(path) {
    return `module.exports = require('./tools/${path}')`
  }

  // NOTE: Keep this alphabetically ordered.
  // [filename, contents, ignore]
  // When `ignore` is set it means we don't want to generate it from a template.
  //   Used to help us warn user that a file is missing a template.
  // prettier-ignore
  const fileTemplates = [
    ['ava.config.cjs', moduleExportsRequireTools('ava/ava.config.js')],
    ['jest.config.js', moduleExportsRequireTools('jest/jest.config.js')],
    ['wallaby.ava.js', moduleExportsRequireTools('wallaby/wallaby.ava.js')],
    ['wallaby.jest.js', moduleExportsRequireTools('wallaby/wallaby.jest.js')],
    ['live.config.js', moduleExportsRequireTools('live/live.config')],
    //['docs/readme.md', ''],
    ['.github/.keep', ''],
    ['.circleci/config.yml', ''],
    ['codecov.yaml', codecovYml],
    ['.codeclimate.yml', codeclimateYml],
    ['.gitattributes', gitattributes],
    ['.gitignore', gitignore],
    ['commitlint.config.js', moduleExportsRequireTools('commitlint/commitlint.config.js')],
    ['husky.config.js', moduleExportsRequireTools('husky/husky.config.js')],
    ['lint-staged.config.js', moduleExportsRequireTools('lint-staged/lint-staged.config.js')],
    ['.eslintignore', 'template-monorepo-files'],
    // eslint-disable-next-line quotes
    ['.eslintrc.js', "module.exports = {extends: ['./tools/eslint/.eslintrc.js']}"],
    ['.npmrc', '', true],
    ['.nvmrc', 'v14.2.0'],
    // TODO(vjpr): This is not working.
    // We have to rename otherwise pnpm will try to use it.
    ['package.json', JSON.stringify(pjson, null, 2) + '\n', false, 'package.template.json'],
    ['package.json.md', pjsonNotesMd],
    ['babel.config.js', moduleExportsRequireTools('babel/babel.config.js')],
    ['pnpm-lock.yaml', '', true],
    // We have to rename otherwise pnpm will try to use it.
    ['pnpm-workspace.yaml', pnpmWorkspaceYaml, false, 'pnpm-workspace.yaml'],
    ['pnpmfile.js', moduleExportsRequireTools('pnpm/pnpmfile.js')],
    ['prettier.config.js', moduleExportsRequireTools('prettier/prettier.config.js')],
    ['readme.md', readmeMd],
    ['tsconfig.json', tsconfigJson],
    ['tsconfig.json.md', tsconfigMd],
    ['tools.config.cjs', ''],
    // TODO(vjpr): This should be ignored.
    ['pnpm-debug.log', '', true],
    ['.env.example', ''],
    ['LICENSE.md', licenseMd],
    ['.env', '', true], // Ignored.
    ['.graphqlconfig', '', true], // Generated.
    ['babel-manifest.json', '', true], // Generated.
    ['jbp.config.js', '', true], // Ignore for now.
    ['live.docker.config.js', '', true],  // Ignore for now.
    ['plopfile.js',  '', true], // Ignore for now.
    ['pm2.config.js', '', true],  // Ignore for now.
    ['pm2.prod.config.js', '', true],  // Ignore for now.
    ['tasksfile.js', moduleExportsRequireTools('tasksfile/tasksfile.js')],
  ]

  await printDifference({from, fileTemplates})

  // --

  for (let [file, contents, ignore, rename] of fileTemplates) {
    const dest = join(to, file)
    if (ignore) continue
    console.log(c.green('+ ' + t(dest)))
    fse.ensureFileSync(dest)
    contents = contents.trimLeft()
    fse.writeFileSync(dest, contents)
  }
  console.log()
}

function getExistingRootFiles(dir) {
  // We deal with these in a separate stage.
  const ignoreDirs = [
    paths.toolsDir, // `tools`
  ]

  return glob.sync('**', {
    cwd: dir,
    // Keep alphabetically ordered as would be in file-system tree.
    ignore: [
      ...ignoreDirs,
      '.git',
      '.dev',
      '.idea',
      '**/node_modules/**',
      '.clinic/**',
      'tmp',
      paths.reposDir, // `repos`
      '.DS_Store',
    ],
    dot: true,
  })
}

////////////////////////////////////////////////////////////////////////////////

async function printDifference({from, fileTemplates}) {
  const existingFiles = getExistingRootFiles(from)

  // Warn which file templates are not present in the root.

  let extranousFiles = []
  for (const [file, contents, ignore] of fileTemplates) {
    if (ignore) continue
    if (!existingFiles.find(el => el === file)) {
      extranousFiles.push(file)
    }
  }

  if (extranousFiles.length) {
    let msg =
      'File template not present in root (maybe it was renamed or deleted).\n'
    msg += 'Please remove/rename in file templates list.'
    console.error(c.red(msg))
    console.error(extranousFiles)
  }

  // Warn which files we don't have templates for.

  let missingTemplates = []
  for (const existingFile of existingFiles) {
    const fileTemplate = _(fileTemplates).find(
      ([fileTemplateName]) => fileTemplateName === existingFile,
    )
    if (!fileTemplate) {
      missingTemplates.push(existingFile)
    }
  }

  if (missingTemplates.length) {
    let msg = 'File template not found for following files.\n'
    msg +=
      'When we find an existing file, we generate a generic version because manual modifications may have been made to the existing one, or we ignore it.\n'
    msg += 'Please add to file templates list and set ignore to true.'
    console.error(c.red(msg))
    console.error(missingTemplates)
  }

  if (extranousFiles.length || missingTemplates.length) {
    process.exit()
  }
}
