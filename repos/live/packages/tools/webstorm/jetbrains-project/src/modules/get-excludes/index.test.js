import test from 'ava'
//import getExcludes from './with-find-down'
//import getExcludes from './with-pjson'
import getExcludes from './index'
import flatten from 'flat'
import {vol} from '@src/modules/mock-fs-with-memfs'

test('get excludes debug', async t => {
  setupFixtures()
  const cwd = '/app' // memfs fixture
  //const cwd = '/Users/Vaughan/dev-live'
  //const cwd = '/Users/Vaughan/dev-live/xxx'
  const dirGlobs = [
    'node_modules',
    'lib',
    'flow-typed',
    'build',
    'tmp',
    '.idea',
    '.next',
  ]
  //const dirGlobs = ['node_modules']
  const fileVisits = {}
  const actual = getExcludes({dirGlobs, cwd})
  const expected = [
    'node_modules',
    'packages/a/node_modules',
    'packages/b/node_modules',
  ]
  const expectedFileVisits = {}
  //console.log('dirs to exclude:', actual)
  //console.log('visited files:', fileVisits)
  t.deepEqual(expected, actual)
  //t.deepEqual(expectedFileVisits, cache)
  vol.reset()
})

function setupFixtures() {
  const keep = {'.keep': ''}

  const nodeModulesDir = {
    '.bin': '',
    a: {
      'package.json': '',
      node_modules: keep,
    },
    b: {
      'package.json': '',
      node_modules: keep,
    },
  }

  const lernaJson = JSON.stringify({packages: 'packages/**'})
  const packageJson = JSON.stringify({name: 'app', version: '0.0.1'})

  const files = flatten(
    {
      '/app': {
        'lerna.json': lernaJson,
        'package.json': packageJson,
        a: {b: {c: keep}},
        packages: {
          a: {
            'package.json': '',
            node_modules: nodeModulesDir,
          },
          b: {
            'package.json': '',
            node_modules: nodeModulesDir,
          },
        },
        node_modules: {
          a: {
            'package.json': '',
            node_modules: {
              b: {
                'package.json': '',
                node_modules: nodeModulesDir,
              },
            },
          },
        },
      },
    },
    {delimiter: '/'},
  )
  vol.reset()
  vol.fromJSON(files)
}
