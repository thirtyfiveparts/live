import pg from 'pg'
import session from 'express-session'
import connectPgSimple from 'connect-pg-simple'

const pgSession = connectPgSimple(session)

export function setupSession({sequelize, app}) {
  const conf = sequelize.config

  const pgPool = new pg.Pool({
    host: conf.host,
    user: conf.username,
    password: conf.password,
    database: conf.database,
  })

  ////////////////////

  //const corsOptions = {
  //  origin: '<insert uri of front-end domain>',
  //  credentials: true,
  //}
  //app.use(cors(corsOptions))

  ////////////////////

  app.use(
    session({
      store: new pgSession({
        pool: pgPool,
        tableName: 'sessions',
        schemaName: 'core',
      }),
      secret: process.env.SESSION_SECRET ?? '8ByTx*274p',
      resave: false,
      cookie: {maxAge: 30 * 24 * 60 * 60 * 1000}, // 30 days
    }),
  )
}
