import dedent from 'dedent'
import {format} from 'sql-formatter'
import {QueryTypes} from 'sequelize'
import _ from 'lodash'

// Warning if using pgpool.
// https://stackoverflow.com/questions/5408156/how-to-drop-a-postgresql-database-if-there-are-active-connections-to-it#comment73461454_5408501
export async function terminateAllConnectionsToDatabaseExceptUs({
  db,
  database,
  postgresConnectionName,
  useConnectionName,
}) {
  //const database = `current_database()`
  const env = process.env.NODE_ENV || 'development'
  //if (env === 'development' || env === 'production') return
  if (env === 'production') return

  // Wrap db name in quotes.
  database = `'${database}'`

  const backendPid = await getBackendPid(db)
  const currentDatabase = await getCurrentDatabase(db)
  console.log({backendPid, currentDatabase})

  let sql = dedent`
    SELECT pg_terminate_backend(pg_stat_activity.pid)
    FROM pg_stat_activity
    WHERE datname = ${database}
      AND pid <> pg_backend_pid()
  `

  // Use this if multiple workers are sharing a single database, which happens
  // during migrations.
  // TODO(vjpr): Alternatively we could create maintenance dbs for each worker to connect to.
  if (useConnectionName && postgresConnectionName)
    sql += `\nAND pg_stat_activity.application_name = '${postgresConnectionName}'`

  sql += ';'

  sql = format(sql)
  const [results, metadata] = await db.query(sql)
  console.log(`Killed ${metadata.rowCount} connections`)

  return
}

////////////////////////////////////////////////////////////////////////////////

async function queryOne(db, query) {
  const [results, metadata] = await db.query(query)
  return _.first(results)
}

async function getBackendPid(db) {
  const res = await queryOne(db, 'SELECT pg_backend_pid();')
  return res.pg_backend_pid
}

async function getCurrentDatabase(db) {
  const res = await queryOne(db, 'SELECT current_database();')
  return res.current_database
}

async function listDatabases(db) {
  const q = dedent`
    SELECT * FROM pg_database
    WHERE datistemplate = false;
  `
  const [results, metadata] = await db.query(q)
  return results.map(r => r.datname)
}
