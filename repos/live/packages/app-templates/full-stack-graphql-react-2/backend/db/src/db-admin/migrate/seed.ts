import {migrate} from '@src/db-admin/migrate'
import {join} from 'path'
import dbsDir from '@src/dbs/dirname'

export default async function seed({db, databaseGroup, seedConfig, initDb}) {
  const seedsPath = join(dbsDir, databaseGroup, 'seeds')
  const seedFn = require(seedsPath).default
  await initDb({sequelize: db})
  await seedFn({db, databaseGroup, seedConfig})
}
