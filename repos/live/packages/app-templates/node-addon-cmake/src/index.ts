import bindings from 'bindings'
import assert from 'assert'

export default async function() {

  const addon = bindings('addon.node')
  const {add} = addon
  const res = add(1, 1)
  console.log({res})
  assert.equal(res, 2)

}
