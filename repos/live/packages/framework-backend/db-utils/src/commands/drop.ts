import to from 'await-to'
import dedent from 'dedent'
import logger from '@live/logger'
import formatDatabaseConnection from '@src/util/format-database-connection'
import {terminateAllConnectionsToDatabaseExceptUs} from '@src/util/terminate-all-connections-to-database-except-us'

export default async function dropDb({databaseName, db, dryRun}) {
  await terminateAllConnectionsToDatabaseExceptUs({db, database: databaseName})
  const connStr = formatDatabaseConnection(db.config)
  logger.info(`Dropping database '${databaseName}' from ${connStr}`)
  const query = `DROP DATABASE IF EXISTS ${databaseName};`
  logger.sql(query)
  if (dryRun) return
  const [err, res] = await to(db.query(query, {raw: true}))
  if (err) throw err
  const [rows, metadata] = res
  //await listDatabases(db)
  logger.info(`Success.`)
  return true
}

////////////////////////////////////////////////////////////////////////////////

async function listDatabases(db) {
  const q = dedent`
    SELECT * FROM pg_database
    WHERE datistemplate = false;
  `
  const [results, metadata] = await db.query(q)
  return results.map(r => r.datname)
}
