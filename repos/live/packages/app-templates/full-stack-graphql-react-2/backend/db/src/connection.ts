import {connect} from '@live/db-utils'

import {Sequelize} from 'sequelize-typescript'
import pg from 'pg'
import 'dotenv/config'
import logger from '@live/logger'

// // TODO(vjpr): Does this need to be here?
// Bug fix.
delete pg.native

import sequelizeHierarchy from '@vjpr/sequelize-hierarchy'
import makeModels from './register-models'

import config from './config'
import {getKnexDbConfig} from '@live/db-utils/src/connect-knex'
import {getSequelizeDbConfig} from '@live/db-utils'
import Knex from 'knex'

sequelizeHierarchy(Sequelize)

let database

export default async function ({database: databaseGroup, env, admin}) {
  // TODO(vjpr): Allow configuring an admin account for migrations.
  admin = admin ?? false

  const appName = 'sequelize'

  const dbConfig = getSequelizeDbConfig({
    database: databaseGroup,
    env,
    config,
    appName,
    admin,
  })

  // Remove `dialectModule` from `dbConfig`.
  const {dialectModule, ...shortdbConfigg} = dbConfig
  logger.info('Connecting to database', shortdbConfigg)

  const sequelize = await connect(dbConfig)

  await initDb({sequelize})

  database = sequelize

  database.databaseGroup = databaseGroup

  return sequelize
}

export {database}

////////////////////////////////////////////////////////////////////////////////

export async function initDb({sequelize}) {
  makeModels({sequelize})
}

////////////////////////////////////////////////////////////////////////////////

export async function connectKnex({database: databaseGroup, env}) {
  const appName = 'knex'
  const knexConfig = getKnexDbConfig({database: databaseGroup, env, config, appName})
  const knex = Knex(knexConfig)
  knex.databaseGroup = databaseGroup
  return knex
}

//export async function connectKnex({database, env}) {
//  // TODO(vjpr): Allow using Knex query builder for easily writing complex queries.
//  const dbConfig = getKnexDbConfig({database, env, config, appName})
//  // TODO(vjpr): Generate app name.
//  const appName = 'knex'
//  const knex = await connectKnex({database, env, dbConfig, appName})
//  return knex
//}
