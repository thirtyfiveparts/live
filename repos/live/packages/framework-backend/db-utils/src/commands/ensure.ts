import to from 'await-to'
import _ from 'lodash'
import logger from '@live/logger'
import formatDatabaseConnection from '@src/util/format-database-connection'

const PG_ERR_DATABASE_EXISTS = '42P04'

export default async function ensureDb({databaseName, db}) {

  const connStr = formatDatabaseConnection(db.config)
  logger.info(`Creating database '${databaseName}' on ${connStr}`)

  const exists = await dbExists(db, databaseName)
  if (exists) {
    logger.info('Database already exists.')
    return await ret(true)
  }

  const [err, res] = await to(db.query(`CREATE DATABASE ${databaseName};`))
  if (err && err.code === PG_ERR_DATABASE_EXISTS) {
    console.log('Database already exists.')
    return await ret(true)
  }
  if (err) throw err
  console.log(`Database '${databaseName}' was created.`)
  return await ret(true)

  async function ret(val) {
    // Close db outside.
    //await db.close()
    //console.log('Closed connection')
    return val
  }
}

////////////////////////////////////////////////////////////////////////////////

async function dbExists(db, database) {
  const dbExistsSql = `select exists(SELECT datname FROM pg_catalog.pg_database WHERE lower(datname) = lower('${database}'));`
  const [err, res] = await to(db.query(dbExistsSql))
  if (err) throw err
  const [rows, metadata] = res
  const {exists} = _.first(rows)
  return exists
}
