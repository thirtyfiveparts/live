import _ from 'lodash'
import logger from './logger'
import Knex from 'knex'
import {getEnv} from '@live/config'

// Knex has a nice query builder.
export async function connectKnex(dbConfig) {
  const knex = Knex(dbConfig)
  return knex
}

// Read configuration to Knex format.
export function getKnexDbConfig({database, env, config, appName}) {

  appName = appName ?? ''

  // TODO(vjpr): Error checking.
  const dbConfig = _.get(config, [database, env])

  // Sequelize and Knex `user` is different.

  const {host, username, password, database: databaseName} = dbConfig

  const knexConfig = {
    client: 'pg',
    connection: {
      host,
      user: username,
      password,
      database: databaseName,
      //searchPath: 'public',
      // See: https://github.com/tgriesser/knex/issues/1738
      //application_name: 'foo',
    },
  }

  return knexConfig

}
