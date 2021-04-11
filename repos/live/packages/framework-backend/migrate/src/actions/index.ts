import {getDatabaseConfigFromArgs} from '../modules/get-database-config-from-args'
import {connectToPgDatabase} from '../modules/connect-to-pg-database'
import ensureDb from '@live/db-utils/src/commands/ensure'
import {connectKnex} from '@live/db-utils/src/connect-knex'
import cleanDb from '@live/db-utils/src/commands/clean'
import {connect} from '@live/db-utils/src'
import dropDb from '@live/db-utils/src/commands/drop'
import c from 'chalk'

// TODO(vjpr): It's quite complicated having to use two connections because we can't drop our currently connected database.
//   Maybe there is a way to switch our connection using sql?
//   `USE DATABASE xxx`
export async function setup({dbConfig, knexConfig, airtableScoutId}, config) {
  const databaseName = dbConfig.database
  const databaseGroup = dbConfig.databaseGroup
  const dbAdmin = await connectToPgDatabase(dbConfig)
  // Create.
  await ensureDb({databaseName, db: dbAdmin})
  // Migrate.
  // NOTE: DB won't exist before this so don't try to connect.
  const db = await connect(dbConfig)
  await config.migrator.migrate({db, databaseGroup})
  // Seed.
  const initDb = config.initDb
  const seedConfig = {
    // Scout with user email of `vaughan@thirtyfive.com`.
    airtableScoutId: airtableScoutId ?? 'recqOpTokXGumDFIT',
  }
  // NOTE: This eventually calls: `repos/gd-scratch/packages/libs/core.db/src/dbs/primary/seeds/index.ts`
  await config.migrator.seed({db, databaseName, databaseGroup, initDb, seedConfig})
  await db.close()
}

export async function clean({dbConfig, knexConfig}) {
  const databaseName = dbConfig.database
  const db = await connect(dbConfig)
  const knex = await connectKnex(knexConfig)
  await cleanDb({databaseName, db, knex})
}

export async function seed({dbConfig}) {
  const databaseName = dbConfig.database
  const databaseGroup = dbConfig.databaseGroup
  const db = await connect(dbConfig)
  const initDb = config.initDb
  await config.migrator.seed({db, databaseGroup, initDb})
}

export async function migrate({dbConfig}, config) {
  const databaseName = dbConfig.database
  const databaseGroup = dbConfig.databaseGroup
  const db = await connect(dbConfig)
  await config.migrator.migrate({db, databaseGroup})
}

export async function generateMigration({dbConfig, migrationName}, config) {
  const databaseName = dbConfig.database
  const databaseGroup = dbConfig.databaseGroup
  const db = await connect(dbConfig)
  const initDb = config.initDb
  await config.migrator.generateMigration({db, databaseGroup, migrationName, initDb})
  await db.close()
}

export async function reset({dbConfig, knexConfig, env, dryRun, drop}, config) {

  // Do we want to drop db or just clear all tables. We don't have to close the connection if we clean.
  if (drop) {
    const databaseName = dbConfig.database
    const dbAdmin = await connectToPgDatabase(dbConfig)
    await dropDb({db: dbAdmin, dbConfig, env, dryRun})
  } else {
    try {
      await clean({dbConfig, knexConfig})
    } catch (e) {
      console.log('Database does not exist. You must run command with --drop.')
      process.exit()
    }
  }

  await setup({dbConfig, knexConfig, airtableScoutId: false}, config)
}

////////////////////////////////////////////////////////////////////////////////

export async function drop({dbConfig, env, dryRun}, config) {
  const databaseName = dbConfig.database
  const db = await connectToPgDatabase(dbConfig)
  if (env === 'remoteProduction' || env === 'production') {
    // TODO(vjpr): Test this!
    await confirmDropDb()
  }
  await dropDb({databaseName, db, dryRun})
}

async function confirmDropDb() {
  const prompt = new Confirm('Are you sure you want to drop this database')
  const answer = await prompt.run()
  if (!answer) {
    console.log('Exiting')
    process.exit(1)
  }
  console.error(
    'You are trying to drop a production database. Exiting because we have not tested the confirmation prompt.',
  )
  process.exit(1)
}

