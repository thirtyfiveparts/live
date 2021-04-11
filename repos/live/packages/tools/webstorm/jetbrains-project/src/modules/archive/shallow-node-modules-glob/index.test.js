import test from 'ava'
import {join} from 'path'
import {vol} from '@src/modules/mock-fs-with-memfs'
import {includes} from 'lodash'
import flatten from 'flat'
import patterns from './index'
import glob from 'globby'

test.skip('regex finds nested node_modules dirs', t => {
  const files = flatten(
    {
      '/mono-idea-project': {
        foo: {
          bar: {node_modules: {}},
          node_modules: {bar: {node_modules: {}}},
        },
        node_modules: {foo: {node_modules: {bar: {}}}},
      },
    },
    {delimiter: '/'},
  )
  vol.reset()
  vol.fromJSON(files)

  //console.log({patterns})

  // A regex for reference.
  //const pattern = '^.*?node_modules(?=\/|$)'

  const nodeModulesDirs = glob.sync(patterns, {
    cwd: '/mono-idea-project',
  })

  // DEBUG
  //console.log({nodeModulesDirs})

  // DEBUG
  //console.log('mocked dir tree', glob.sync('/some/path/**'), {cwd})

  const expected = [
    'node_modules',
    'foo/node_modules',
    'foo/bar/node_modules',
    // TODO(vjpr): We don't want to match this as the top-level node_modules will handle this.
    //   I couldn't work out how though.
    'node_modules/foo/node_modules',
  ]

  t.true(includes(nodeModulesDirs, expected))

  vol.reset()
})
