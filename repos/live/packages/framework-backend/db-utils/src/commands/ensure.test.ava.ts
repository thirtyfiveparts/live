import test from 'ava'
import ensureDb from './ensure'
import dropDb from './drop'

const databaseName = 'foo'

test.skip('ensure-db', async t => {
  const res = await ensureDb({db, databaseName})
  console.log(res)
})

test.skip.after(async t => {
  await dropDb({db, databaseName})
})
