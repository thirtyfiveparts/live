const debug = require('debug')('index-test')
import path, {join} from 'path'
import fs from 'fs'
import chaiFs from 'chai-fs'
import * as cli from '../cli/replant'
require('chai').use(chaiFs)
const expect = require('chai').expect
import CliTestHelper from '../cli/cli-test-helper'
import _ from 'lodash'
const mountFs = require('mountfs')
const MockFs = require('mock-fs')
const tmpFs = require('../util/tmp-fs')

////////////////////////////////////////////////////////////////////////////////

const mockMountPath = '/replant-test-mount-path'
mountFs.patchInPlace()

function setupTreeWithMountFs(tree) {
  const testRoot = '/test-root'
  const rootDir = join(mockMountPath, testRoot)
  const mockFs = MockFs.fs({[testRoot]: tree}, {
    createCwd: false, createTmp: false,
  })
  fs.mount(mockMountPath, mockFs)
  //console.log('Mounted tree:', require('globby').sync(mockMountPath + '/**', {dot: true, cwd: '/'}))
  return rootDir
}

////////////////////////////////////////////////////////////////////////////////

function setupTreeWithTmpFs(tree) {
  return tmpFs(tree)
}

////////////////////////////////////////////////////////////////////////////////

describe('Module', function() {

  beforeEach(function() {
    this.replantFileName = '.replant.yml'
    const pjson = {name: 'a', version: '0.0.0'}
    const tree = {
      'package.json': JSON.stringify(pjson, null, 2),
      'index.js': "require('./modules/bar')",
      modules: {
        bar: {
          'index.js': "require('../foo')",
        },
        foo: {
          'index.js': '',
        },
      },
    }
    ////////////////////////////////////////////////////////////////////////////////
    this.rootDir = setupTreeWithTmpFs(tree)
    ////////////////////////////////////////////////////////////////////////////////
    //this.rootDir = setupTreeWithMountFs(tree)
    ////////////////////////////////////////////////////////////////////////////////
    debug('Using root dir:', this.rootDir)
    debug('Tree:', require('globby').sync('**', {dot: true, cwd: this.rootDir}))
    debug('Read file (smoke test):', fs.readFileSync(join(this.rootDir, 'index.js'), 'utf8'))
  })

  afterEach(() => {
    //fs.unmount(mockMountPath)
    //mock.restore() // Not needed now that we use `mock.fs`.
    //tmpFs.restore()
  })

  it('create replant file if it doesn\'t exist', async function() {
    const opts = {quiet: true, cwd: this.rootDir}
    await cli.run(opts)
    const file = join(this.rootDir, this.replantFileName)
    expect(file).to.be.a.file
  })


  describe('when a module is moved', function() {

    it('should update its own dependencies', async function() {
      this.timeout(5000)
      const opts = {quiet: true, cwd: this.rootDir, noPrompt: true}
      await cli.run(opts)
      const script = (fileToIdCurrent) => {
        //console.log('in', fileToIdCurrent)
        const out = moveFile(this.rootDir, fileToIdCurrent, 'modules/bar/index.js', 'modules-bar-index.js')
        //console.log('out', out)
        return out
      }
      await cli.run({script, commit: true, ...opts})
      //printTree(opts.cwd)
      const p = join(this.rootDir, '/modules-bar-index.js')
      expect(p).to.be.a.file()
      expect(p).to.have.content("require('foo')") // Because it uses roots if possible.
    })

    it.skip('should use root-relative request path if inside root and not inside the same folder in the root', async function() {
      //See `modify-dependents#getNewPath`.
    })

  })

})

// TODO(vjpr): This could be a helper made available to the script?
function moveFile(cwd, fileToIdCurrent, from, to, contents) {
  const obj = _.mapKeys(fileToIdCurrent, (v, k) =>
    k === from ? to : k
  )
  if (contents) {
    fs.writeFileSync(join(cwd, to), contents)
  }
  return obj
}

function printTree(cwd) {
  console.log(require('globby').sync('**', {dot: true, cwd}))
}
