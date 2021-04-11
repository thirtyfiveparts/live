import {connect} from '@live/db-utils/src'

export async function connectToPgDatabase(dbConfig) {
  // We can't drop the database we are connected to so we connect to `postgres`.
  const configWithPgDatabase = {...dbConfig, database: 'postgres'}
  const db = await connect(configWithPgDatabase)
  return db
}
