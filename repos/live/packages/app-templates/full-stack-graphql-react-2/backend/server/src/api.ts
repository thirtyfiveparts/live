import getSchema from './schema'
import Container from 'typedi'
import {DB} from '@src/db'
import express from 'express'
import {getModelToken} from '@live/sequelize-typescript-helpers/src/sequelize.decorators'
import protectMiddleware from '@live/server/src/modules/auth/protect-middleware'
import {makeApolloServer} from '@live/server/src/modules/apollo'
import {setupSession} from '@live/server/src/modules/session'
import {setupAuth} from '@live/server/src/modules/auth/setup-auth'
import * as models from '@sidekicks/core.db/src/models'
import setupMigrateViaRequest
  from '@live/server/src/modules/setup-migrate-via-request'
import migrator from '@sidekicks/core.db/src/db-admin/migrate'
import {initDb} from '@sidekicks/core.db/src/connection'
//import airtableSync from '@src/modules/airtable-sync'

export default async function ({sequelize, knex, logger}) {
  // Create a singleton.
  Container.set(DB, new DB(sequelize))

  const models = registerModels(Container)

  const schema = await getSchema()

  const app = express()

  const server = makeApolloServer({schema, logger, models})

  const graphqlPath = '/graphql'

  await setupMigrateViaRequest({app, db: sequelize, migrator, initDb})

  //await airtableSync(app)

  setupSession({sequelize, app})

  setupAuth({app})

  // TODO(vjpr): Block access unless you are logged in. But allow login/currentUser!!!

  app.use(protectMiddleware())

  server.applyMiddleware({app, path: graphqlPath})

  return app
}

////////////////////////////////////////////////////////////////////////////////

function registerModels(Container) {
  // Add all Model constructors so we can inject them into services.
  for (const [name, Model] of Object.entries(models)) {
    // How nest.js does it.
    //   See https://github.com/nestjs/sequelize/blob/d290fc0e8cf9417882234ad2de21c2fb02ecbc55/lib/common/sequelize.decorators.ts
    const modelToken = getModelToken(Model)
    Container.set(modelToken, Model)
  }
  return models
}
