import start from '@live/server/src/modules/start'
import migrate from '@src/migrate'
import connect, {connectKnex} from '@sidekicks/core.db/src/connection'
import getApp from './index'

export default async function () {
  const database = process.env.DB_DATABASE_GROUP ?? 'primary'
  const env = process.env.DB_ENV ?? 'development'
  await start({database, env, migrate, connect, connectKnex, getApp})
}
