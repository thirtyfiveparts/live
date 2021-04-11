import test from 'ava'
import pathDescendsFrom from './index'

test('path-descends-from', async t => {
  const no = [
    '/node_modules',
    './node_modules',
    'node_modules',
    'bar/node_modules',
    'a/foo_node_modules/b',
    'a/node_modules_foo/b',
  ]

  const yes = ['node_modules/foo', 'a/node_modules/b']

  const dir = 'node_modules'
  no.map(p => t.false(pathDescendsFrom(p, dir)))
  yes.map(p => t.true(pathDescendsFrom(p, dir)))
})
