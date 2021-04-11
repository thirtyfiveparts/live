import test from 'ava'
import {imageExists} from './index'

test.skip('test', async t => {
  const res = await imageExists('blah')
  console.log(res)
})
