import _ from 'lodash'
import logger from './logger'
import {Sequelize} from 'sequelize-typescript'
import {getEnv} from '@live/config'
import getDatabaseName from '@live/wallaby-db/src/get-database-name'

/**
 * Return a Sequelize connection to a database.
 *
 * config - the Sequelize database configuration file
 * database - the desired database to connect to (e.g. primary, my_other_db)
 * env - specify which database environment to connect to (e.g. development, production)/
 */
export async function connect(config) {
  const sequelize = new Sequelize(config as any)
  await sequelize.authenticate()
  return sequelize
}

// Read configuration,
export function getSequelizeDbConfig({database, env, config, appName, admin}) {
  appName = appName ?? ''

  // TODO(vjpr): Error checking.
  const dbConfig = _.get(config, [database, env])

  // Customize db name when testing.
  const databaseName = getDatabaseName(dbConfig)

  const defaultConfig = {
    logging: parseInt(getEnv('SQL_LOGGING')) ? logger : false,
    benchmark: true,
    define: {
      underscored: true,
    },
    dialectOptions: {
      appName,
    },
    // Our options.
    databaseGroup: database,
  }

  const resolvedConfig = _.merge(defaultConfig, dbConfig, {
    database: databaseName,
  })

  if (admin) {
    resolvedConfig.database = 'postgres'
  }

  return resolvedConfig
}
