import {ApiModel} from '@microsoft/api-extractor-model'
import {
  Extractor,
  ExtractorConfig,
  ExtractorResult,
  IExtractorConfigPrepareOptions,
} from '@microsoft/api-extractor'
import {join} from 'path'
import fse from 'fs-extra'
//import { MarkdownDocumenter } from '@microsoft/api-documenter/( documenters/MarkdownDocumenter';
import {MarkdownDocumenter} from '@microsoft/api-documenter/lib/documenters/MarkdownDocumenter'
import c from 'chalk'
import * as ts from 'typescript'
import glob from 'globby'
import {MarkdownDocumenterReadme} from '@src/documenter-markdown-readme'
import documenterMarkdownReadmeSimple from '@src/documenter-markdown-readme-simple'

export default async function ({pkgDir}) {
  const {apiJsonFilePath} = await runExtract({pkgDir})
  const docsFolder = join(pkgDir, 'docs/api')
  await generateAll({docsFolder, apiJsonFilePath})
}

export async function generateReadmeSimple({pkgDir}) {
  // TODO(vjpr): Can we check if we need to run this again?
  await runExtract({pkgDir}) // Optional
  // --
  const {apiJsonFilePath} = getPaths({pkgDir})
  const apiModel = getApiModel(apiJsonFilePath)
  const contents = documenterMarkdownReadmeSimple({apiModel})
  return contents
}

////////////////////////////////////////////////////////////////////////////////

export async function runExtract({pkgDir}) {
  const {
    pjsonPath,
    pjson,
    unscopedPackageName,
    compiledDir,
    tmpDir,
    apiJsonFilePath,
  } = getPaths({pkgDir})

  fse.ensureDirSync(tmpDir)
  fse.ensureDirSync(compiledDir)

  await makeDTSFile({pkgDir})

  const extractorResult = await extract({
    pkgDir,
    pjsonPath,
    unscopedPackageName,
    compiledDir,
    tmpDir,
    apiJsonFilePath,
  })

  //console.log(extractorResult)
  return {apiJsonFilePath}
}

function getPaths({pkgDir}) {
  const pjsonPath = join(pkgDir, 'package.json')
  const pjson = fse.readJsonSync(pjsonPath)
  const unscopedPackageName = removePkgNameScope(pjson.name)
  const compiledDir = join(pkgDir, 'typings')
  const tmpDir = join(pkgDir, 'tmp')
  const apiJsonFilePath = join(tmpDir, `${unscopedPackageName}.api.json`)
  return {
    pjsonPath,
    pjson,
    unscopedPackageName,
    compiledDir,
    tmpDir,
    apiJsonFilePath,
  }
}

async function generateAll({docsFolder, apiJsonFilePath}) {
  const apiModel = getApiModel(apiJsonFilePath)

  fse.ensureDirSync(docsFolder)
  const outputFolder = docsFolder

  // Equivalent to `api-documenter markdown`
  const markdownDocumenter: MarkdownDocumenter = new MarkdownDocumenter({
    apiModel,
    documenterConfig: undefined,
    outputFolder,
  })
  markdownDocumenter.generateFiles()

  // Generates an overview for the readme file like sindre's readmes.
  const markdownDocumenterReadme = new MarkdownDocumenterReadme({
    apiModel,
    documenterConfig: undefined,
    outputFolder,
  })
  markdownDocumenterReadme.generateFiles()
}

async function generateOnlyReadme({docsFolder, apiJsonFilePath}) {
  const apiModel = getApiModel(apiJsonFilePath)

  fse.ensureDirSync(docsFolder)
  const outputFolder = docsFolder

  // Generates an overview for the readme file like sindre's readmes.
  const markdownDocumenterReadme = new MarkdownDocumenterReadme({
    apiModel,
    documenterConfig: undefined,
    outputFolder,
  })
  markdownDocumenterReadme.generateFiles()
}

////////////////////////////////////////////////////////////////////////////////

function getApiModel(apiJsonFilePath) {
  const apiModel = new ApiModel()
  apiModel.loadPackage(apiJsonFilePath)
  return apiModel
}

// Same as `api-extractor run --local --verbose`
async function extract(opts) {
  const configPrepareOpts = getConfig(opts)
  const extractorConfig: ExtractorConfig = ExtractorConfig.prepare(
    configPrepareOpts,
  )

  const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
    // Equivalent to the "--local" command-line parameter.
    localBuild: true,
    // Equivalent to the "--verbose" command-line parameter.
    showVerboseMessages: true,
  })
  if (!extractorResult.succeeded) {
    console.error(
      `API Extractor completed with ${extractorResult.errorCount} errors` +
        ` and ${extractorResult.warningCount} warnings`,
    )
    return
  }
  console.log(`API Extractor completed successfully`)
  return extractorResult
}

function removePkgNameScope(pkgName) {
  const parts = pkgName.split('/')
  if (parts.length === 2) {
    return parts[1]
  }
  return parts[0]
}

function getConfig({
  pkgDir,
  pjsonPath,
  pjson,
  unscopedPackageName,
  compiledDir,
  tmpDir,
  apiJsonFilePath,
}) {
  const config: IExtractorConfigPrepareOptions = {
    // See `research/api-extractor.json` for the default file generated by `api-extractor init`.
    configObject: {
      mainEntryPointFilePath: join(compiledDir, 'index.d.ts'),
      projectFolder: pkgDir,
      bundledPackages: [],
      apiReport: {
        enabled: true,
        reportFileName: `${unscopedPackageName}.api.md`,
        reportFolder: compiledDir,
        reportTempFolder: tmpDir,
      },
      docModel: {
        enabled: true,
        apiJsonFilePath,
      },
      compiler: {
        tsconfigFilePath: join(pkgDir, 'tsconfig.json'),
      },
      dtsRollup: {enabled: false},
      tsdocMetadata: {
        enabled: true,
        tsdocMetadataFilePath: join(compiledDir, 'tsdoc-metadata.json'),
      },
      messages: {
        //compilerMessageReporting: {
        //  default: {
        //    logLevel: 'warning',
        //  },
        //  extractorMessageReporting: {
        //    default: {
        //      logLevel: 'warning',
        //    },
        //  },
        //  tsdocMessageReporting: {
        //    default: {
        //      logLevel: 'warning',
        //    },
        //  },
        //},
      },
    },
    configObjectFullPath: undefined, // Doesn't exist - programmatic.
    packageJson: pjson,
    packageJsonFullPath: pjsonPath,
  }
  //console.log(config)
  return config
}

// From: https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#getting-the-dts-from-a-javascript-file
// TODO(vjpr): Incremental builder to speed things up.
//   https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#writing-an-incremental-program-watcher
//   Also, language service can be used maybe.
async function makeDTSFile({pkgDir}) {
  let files = await glob('src/**/*.ts', {
    cwd: pkgDir,
    ignore: ['**/node_modules/**'],
  })
  files = files.map(f => join(pkgDir, f))
  console.log({files})

  //////////////////////////////////////////////////////////////////////////////

  // Get compiler otpions

  // From: https://stackoverflow.com/a/53898219/130910

  // Must be absolute paths or it will error.
  const compilerOptionsOverrides = {
    outDir: join(pkgDir, 'typings/'),
    rootDir: join(pkgDir, 'src/'),
    allowJs: false,
    checkJs: false,
    declaration: true,
    emitDeclarationOnly: true,
    declarationMap: true,
    typeRoots: ['./node_modules/@types'],
  }

  const baseDir = pkgDir
  const tsConfigPath = join(pkgDir, 'tsconfig.json')
  //const tsConfigFile = ts.findConfigFile(baseDir, ts.sys.fileExists, 'tsconfig.json')
  const tsConfigJson = ts.readConfigFile(tsConfigPath, ts.sys.readFile)
  const tsCompilerOptions = ts.parseJsonConfigFileContent(
    tsConfigJson.config,
    ts.sys,
    baseDir,
    compilerOptionsOverrides,
    tsConfigPath,
  )

  // I think this just runs `parseJsonConfigFileContent` behind the scenes.
  // See: https://github.com/Microsoft/TypeScript/issues/5276#issuecomment-148926002
  //const opts = convertCompilerOptionsFromJson(tsConfig, pkgDir, )
  // --

  const opts = tsCompilerOptions.options

  //////////////////////////////////////////////////////////////////////////////

  compile(files, opts)

  function compile(fileNames: string[], options: ts.CompilerOptions): void {
    //process.chdir(pkgDir)
    // Create a Program with an in-memory emit
    const createdFiles = {}
    const host = ts.createCompilerHost(options)
    host.writeFile = (fileName: string, contents: string) => {
      console.log({fileName, contents})
      createdFiles[fileName] = contents
    }

    // Prepare and emit the d.ts files
    const program = ts.createProgram(fileNames, options, host)
    program.emit()

    for (const entry of Object.entries(createdFiles)) {
      const [fileName, contents] = entry
      const outFile = fileName
      console.log(c.cyan('Writing: ' + outFile))
      fse.outputFileSync(outFile, contents)
    }
  }
}

////////////////////////////////////////////////////////////////////////////////

//// Loop through all the input files
//fileNames.forEach(sourceFileName => {
//  //console.log('### JavaScript\n')
//  //console.log(host.readFile(file))
//  ////console.log('### Type Definition\n')
//  //const dtsFileName = sourceFileName.replace('.ts', '.d.ts')
//  //const dtsFileContents = createdFiles[dtsFileName]
//  //
//  //console.log('out file', join(pkgDir, dtsFileName))
//  //console.log({dtsFileContents})
//  ////console.log({dts})
//  ////fse.writeFileSync()
//})