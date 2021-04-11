import test from 'ava'
import config from './config'
import connect from './connection'

test('config.test', async t => {
  const connection = await connect({databaseGroup: 'primary', env: 'development'})
  const actual = config.primary.host
  const expected = 'localhost'
  t.true(actual === 3)
  console.log(2+2)
})
