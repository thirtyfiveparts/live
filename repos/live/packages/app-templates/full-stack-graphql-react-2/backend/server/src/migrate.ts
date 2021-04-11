// Handles migrations on startup.

import connect from '@sidekicks/core.db/src/connection'
import to from 'await-to-js'
import cleanDb from '@live/db-utils/src/commands/clean'
import migrator from '@sidekicks/core.db/src/db-admin/migrate'
import {initDb} from '@sidekicks/core.db/src/connection'
import ensureDb from '@live/db-utils/src/commands/ensure'
import {connectToPgDatabase} from '@live/migrate/src/modules/connect-to-pg-database'

export default async function ({sequelize, sequelizeAdmin, knex}) {
  const shouldMigrate = !parseInt(process.env.NO_MIGRATE)
  const shouldSeed = !parseInt(process.env.NO_SEED)
  const shouldGenerateBaseMigration = !parseInt(
    process.env.NO_GENERATE_MIGRATION,
  )

  let e

  //if (shouldGenerateBaseMigration) {
  //  await generateMigration({sequelize})
  //}

  if (shouldMigrate) {
    const db = sequelize
    const databaseGroup = db.options.databaseGroup
    const databaseName = db.config.database
    console.log(db.config)
    // Clean
    await cleanDb({databaseName, db, knex})
    // Setup
    await ensureDb({databaseName, db: sequelizeAdmin})
    await migrator.migrate({db, databaseGroup})
    await migrator.seed({db, databaseName, databaseGroup, initDb})

    //await legacyDbReset({sequelize})
    //await sequelize.drop({force: true})
    //await sequelize.sync({force: true})
  }

  if (shouldSeed) {
    const db = sequelize
    global.pauseSQLLogging = true
    const config = {migrator, initDb}
    await migrator.seed({db, databaseGroup, initDb})
    global.pauseSQLLogging = false
    if (e) {
      console.log('MAKE FIXTURES FAILED!')
      console.log(e)
      //console.log(e.errors)
      //eslint-disable-next-line no-process-exit
      process.exit()
      return
    }
  }
}
