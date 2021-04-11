
// Truncate tables and seed.
import truncateAllTables from '@live/db-utils/src/commands/truncate-all'

export async function seedReplant({db, shouldSeed, seedConfig}, config) {

  shouldSeed = shouldSeed ?? true

  console.log('Replanting')

  const databaseName = db.config.database
  const databaseGroup = db.options.databaseGroup
  const initDb = config.initDb

  await truncateAllTables({databaseName, db})

  await config.migrator.seed({db, databaseGroup, seedConfig, initDb})

}
