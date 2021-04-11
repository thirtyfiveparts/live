import {connect} from '@live/db-utils'
import {seedReplant} from './actions/replant'
import ensureDb from '@live/db-utils/src/commands/ensure'
import {connectToPgDatabase} from './modules/connect-to-pg-database'
import {getDatabaseConfigFromArgs} from './modules/get-database-config-from-args'
import truncateAllTables from '@live/db-utils/src/commands/truncate-all'
import {
  clean,
  drop,
  generateMigration,
  migrate,
  reset,
  seed,
  setup,
} from './actions'

export function getCommands(config) {
  return [
    dbEnsure,
    dbTruncate,
    dbClean,
    dbReplant,
    dbDrop,
    dbMigrate,
    dbMigrateGenerate,
    dbSetup,
    dbSeed,
    dbReset,
  ].map(fn => fn(config))
}

const databaseArgs = yargs => yargs.option('database').option('env')

// Called `db:seed:replant` by Rails
// https://stackoverflow.com/a/63818092/130910
const dbReplant = (config) => ({
  command: 'db:seed:replant',
  describe: 'Truncate tables, then seed.',
  builder: databaseArgs,
  handler: async argv => {
    const {dbConfigModule} = config
    const {dbConfig} = getDatabaseConfigFromArgs(argv, dbConfigModule)
    const db = await connectToPgDatabase(dbConfig)
    const seedConfig = {} // Seed all records.
    await seedReplant({db, seedConfig}, config)
  },
})

const dbTruncate = (config) => ({
  command: 'db:truncate:all',
  describe: 'Wipe all data from tables except internal ones.',
  builder: databaseArgs,
  handler: async argv => {
    const {dbConfigModule} = config
    const {dbConfig} = getDatabaseConfigFromArgs(argv, dbConfigModule)
    const databaseName = dbConfig.database
    const db = await connect(dbConfig)
    await truncateAllTables({databaseName, db})
  },
})

const dbSeed = config => ({
  command: 'db:seed',
  describe: 'Seed database for testing.',
  builder: databaseArgs,
  handler: async argv => {
    const {dbConfigModule} = config
    const {dbConfig} = getDatabaseConfigFromArgs(argv, dbConfigModule)
    await seed({dbConfig})
  },
})

// NOTE: We don't want to clear everything because there might be a bunch of
//   data from a prod sync.
const dbTruncateModels = (config) => ({
  command: 'db:truncate:models',
  describe: 'Wipe all data from tables that are in our models.',
  builder: databaseArgs,
  handler: async argv => {
    const {dbConfigModule} = config
    const {dbConfig} = getDatabaseConfigFromArgs(argv, dbConfigModule)
    const databaseName = dbConfig.database
    const db = await connect(dbConfig)
    await truncateOurTables({databaseName, db})
  },
})

const dbEnsure = (config) => ({
  command: 'db:ensure',
  describe: 'Create db if not exists.',
  builder: databaseArgs,
  handler: async argv => {
    const {dbConfigModule} = config
    const {dbConfig} = getDatabaseConfigFromArgs(argv, dbConfigModule)
    const databaseName = dbConfig.database
    const db = await connectToPgDatabase(dbConfig)
    await ensureDb({databaseName, db})
  },
})

// Better name is `prepare`?
const dbSetup = config => ({
  command: 'db:setup',
  describe: 'Create, load schema, seed.',
  builder: databaseArgs,
  handler: async argv => {
    const {dbConfigModule} = config
    const {dbConfig} = getDatabaseConfigFromArgs(argv, dbConfigModule)
    await setup({dbConfig}, config)
  },
})

const dbMigrate = config => ({
  command: 'db:migrate',
  describe: 'Migrate.',
  builder: databaseArgs,
  handler: async argv => {
    const {dbConfigModule} = config
    const {dbConfig} = getDatabaseConfigFromArgs(argv, dbConfigModule)
    await migrate({dbConfig}, config)
  },
})

const dbClean = config => ({
  command: 'db:clean',
  describe: 'Drop all tables',
  builder: yargs => databaseArgs(yargs).option('drop'),
  handler: async argv => {
    const {dbConfigModule} = config
    const {dbConfig, knexConfig} = getDatabaseConfigFromArgs(argv, dbConfigModule)
    await clean({dbConfig, knexConfig}, config)
  },
})

const dbReset = config => ({
  command: 'db:reset',
  describe: 'Drop and setup',
  builder: yargs =>
    databaseArgs(yargs)
      // Do we want to drop db or just clear all tables. We don't have to close the connection if we clean.
      .option('drop'),
  handler: async argv => {
    const {drop} = argv
    const {dbConfigModule} = config
    const {dbConfig, knexConfig} = getDatabaseConfigFromArgs(argv, dbConfigModule)
    await reset({dbConfig, knexConfig, drop}, config)
  },
})

export const dbDrop = config => ({
  command: 'db:drop',
  describe: 'Delete database.',
  builder: yargs => yargs.option('db'),
  handler: async argv => {
    const {dbConfigModule} = config
    const {dbConfig, knexConfig} = getDatabaseConfigFromArgs(argv, dbConfigModule)
    const {env, dryRun} = argv
    await drop({dbConfig, env, dryRun}, config)
  },
})

const dbMigrateGenerate = (config) => ({
  command: 'db:migrate:generate',
  describe: 'Migrate',
  builder: yargs => yargs.option('db').option('name'),
  handler: async argv => {
    let {db, name: migrationName} = argv
    const {dbConfigModule} = config
    const {dbConfig} = getDatabaseConfigFromArgs(argv, dbConfigModule)
    const databaseName = dbConfig.database
    migrationName = migrationName ?? 'foo'
    await generateMigration({dbConfig, migrationName}, config)
  },
})

//const commandGenerate = () => ({
//  command: 'migrate:generate',
//  describe: 'generateMigration',
//  builder: yargs => yargs.option('db'),
//  handler: async argv => {
//    //const {db} = argv
//    //const sequelize = await connect()
//    //await generateMigration({db, sequelize})
//  },
//})

////////////////////////////////////////////////////////////////////////////////

// Running standalone.
//export function cli() {
//  const yargs = Yargs(process.argv.slice(2)).demandCommand()
//
//  for (const command of getCommands()) {
//    yargs.command(command)
//  }
//  yargs.argv
//}

////////////////////////////////////////////////////////////////////////////////
