import {getKnexDbConfig} from '@live/db-utils/src/connect-knex'
import {getSequelizeDbConfig} from '@live/db-utils/src'

export function getDatabaseConfigFromArgs(argv, config) {
  const {database, env, dryRun} = argv
  const dbConfig = getSequelizeDbConfig({database, env, config})
  const knexConfig = getKnexDbConfig({database, env, config})
  return {dbConfig, knexConfig}
}
