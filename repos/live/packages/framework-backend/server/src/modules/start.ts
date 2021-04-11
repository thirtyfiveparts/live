import {logger} from '@src/modules/logger'

export default async function({database, env, migrate, connect, connectKnex, getApp}) {
  const sequelizeAdmin = await connect({database, env, admin: true})
  const sequelize = await connect({database, env})
  const knex = await connectKnex({database, env})

  await migrate({sequelize, sequelizeAdmin, knex})

  const app = await getApp({sequelize, knex, logger})
  const port = process.env.PORT ?? 3010
  app.listen({port}, () => {
    logger.info(`🚀  Server ready at http://localhost:${port}`)
  })
}

