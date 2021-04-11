import 'dotenv/config'
import makeModels from './model'
import makeFixtures from './fixtures'
import api from './api'
import db, {connect} from './db'

export default async function () {
  const database = await connect()

  const models = await makeModels({database})
  const migrate = parseInt(process.env.SHOULD_MIGRATE)
  if (migrate) {
    await database.drop({force: true})
    await database.sync({force: true})
    await makeFixtures({database, models})
  }
  await api({database, models})
}

