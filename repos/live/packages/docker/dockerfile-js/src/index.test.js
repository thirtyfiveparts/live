import test from 'ava'
import Dockerfile from './index'

test('test', async t => {

  const df = new Dockerfile()
    .comment('bar')
    .arg('DEPENDENCY_VERSION', 'foo')
    .from({
      registry: 'mhart',
      image: 'alpine-node',
      tag: '11',
      tagArg: 'DEPENDENCY_VERSION',
      as: 'base',
    })
    .entryPoint(['top', '-b'])
    .workdir({str: 'foo'})
    .healthCheck({
      interval: 3,
      timeout: 4,
      cmd: 'foo'
    })
    .volume(['/foo', '/var'])
    .label({foo: 'bar', baz: 'baz', bee: 'bee'})
    .expose([
      '1',
      2,
      {number: 3, protocol: 'tcp'},
      {number: '4', protocol: 'udp'},
    ])
    .arg('DEPENDENCY_VERSION', 'foo')
    .arg({bar: 'bar'})
    .env({foo: 'bar'})
    .heading('Release')
    .comment(
      `Explicitly calling node rather than 'npm start' allows signal propagation (SIGINT, SIGTERM, etc.)`,
    )
    .cmd('node_modules/.bin/live app xxx dev')
    .copy({src: 'foo', dest: 'bar', chown: 'foo:bar'})
    .apkAdd({virtual: 'build-deps', pkgs: ['git', 'bash', 'openssh']})

  const out = df.render()

  //console.error(out)
  t.true(true)
})
