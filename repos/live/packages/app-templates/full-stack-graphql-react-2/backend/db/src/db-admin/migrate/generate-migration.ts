import {SequelizeTypescriptMigration} from '@live/sequelize-typescript-migration'
import path, {join} from 'path'
import dbsDir from '@src/dbs/dirname'

export default async function({db, databaseGroup, migrationName, initDb}) {

  const migrationsPath = join(dbsDir, databaseGroup, 'migrations')

  await initDb({sequelize: db})

  await SequelizeTypescriptMigration.makeMigration(db, {
    outDir: migrationsPath,
    migrationName,
    preview: false,
    debug: true,
  })

}
