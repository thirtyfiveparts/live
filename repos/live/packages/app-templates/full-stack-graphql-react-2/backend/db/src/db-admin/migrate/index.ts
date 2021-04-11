import Umzug from 'umzug'
import SequelizeStorage from 'umzug/lib/storages/SequelizeStorage'
import path, {join} from 'path'
import deleteSequelizeTables
  from '@live/db-utils/src/commands/truncate-models'
import dbsDir from '@src/dbs/dirname'
import seed from './seed'
import generateMigration from './generate-migration'

export default {
  migrate,
  seed,
  generateMigration,
}

export async function migrate({db, databaseGroup}) {

  const migrationsPath = join(dbsDir, databaseGroup, 'migrations')

  const {umzug} = await makeUmzug({db, migrationsPath})

  //await umzug.down({to: 0})

  const pending = await umzug.pending()
  const executed = await umzug.executed()
  console.log({executed, pending})

  await umzug.up()

  // Initial tables.
  //await umzug.up('00000000-define-schemas.ts')
  //await umzug.up('00000001-initial-schema.js')

  // Add company data.
  //await seedCompanies({sequelize})

  // Add index on company table.
  //await umzug.up('20200910122035-full-text-search.ts')
  //await umzug.up('20200910122035-full-text-search-master-startups.ts')
}

////////////////////////////////////////////////////////////////////////////////

export async function makeUmzug({db, migrationsPath}) {

  const umzug = new Umzug({
    migrations: {
      path: migrationsPath,
      params: [db.getQueryInterface()],
      // Support Typescript.
      pattern: /^\d+[\w-]+\.(js|ts)$/,
    },
    storage: new SequelizeStorage({
      sequelize: db,
      modelName: 'sequelize_meta',
    }),
  })

  return {umzug}
}

////////////////////////////////////////////////////////////////////////////////

//async function seedCompanies({sequelize}) {
//
//  console.log('seeding companies')
//  //await sequelize.createSchema('target')
//
//  const { stdout, stderr, code } = await spawn('ls', [ '-al' ], {encoding: 'utf8'});
//
//}

////////////////////////////////////////////////////////////////////////////////

//export async function addIndexToMasterStartups({db, direction}) {
//  const {umzug, sequelize} = await getDb({db})
//  const res = await umzug[direction]('20200910122035-full-text-search-master-startups.ts')
//  console.log({res})
//}
