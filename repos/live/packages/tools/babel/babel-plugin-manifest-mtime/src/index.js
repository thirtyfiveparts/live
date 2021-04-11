import Debug from 'debug'
import fs from 'fs'
import path, {join} from 'path'
const debug = Debug('babel-plugin-example')

//let root = null
const cache = {}

export default function({types: t}) {

  const visitor = {
    Program(path, state) {
      //const isProd = process.env.NODE_ENV === 'production'
      //state.opts.foo = state.opts.foo || !isProd
    },
  }

  return {
    visitor,
    post(state) {
      if (isRunningBabelRegister(state)) return
      const root = state.opts.root
      const filename = state.opts.filename
      // TODO(vjpr): filename is untranspiled source file - we need transpiled location!
      const mTime = fs.statSync(filename).mtimeMs

      const manifestFile = getManifestPath(root)

      // TODO(vjpr): This must be synced with `transpile-checker`.
      const rootRelFilename = path.relative(root, filename)
      //const manifestRelFilename = path.relative(path.dirname(manifestFile), filename)
      //const rootRelOutputPath = join(root, 'lib'...

      const manifestKey = rootRelFilename

      cache[manifestKey] = mTime
      writeManifest(manifestFile)
    },
  }
}

// NOTE: Doesn't work.
//process.on('exit', () => {
//  writeManifest()
//})

// TODO(vjpr): Sync with `transpile-checker`.
function getManifestPath(root) {
  const manifestPath = 'lib/babel-manifest.json'
  const manifestFile = join(root, manifestPath)
  return manifestFile
}

function writeManifest(manifestFile) {
  fs.writeFileSync(manifestFile, JSON.stringify(cache, null, 2))
  //console.log('Writing to', manifestFile)
  //console.log({cache})
}

// Test using `BABEL_DISABLE_CACHE=1 a-cli-tool`.
// We don't want this to run when using @babel/register.
//   When using babel/register, babel-core and presets will already be loaded defeating the purpose of precompiling.
function isRunningBabelRegister(state) {
  return state.opts.caller && state.opts.caller.name === '@babel/register'
}
