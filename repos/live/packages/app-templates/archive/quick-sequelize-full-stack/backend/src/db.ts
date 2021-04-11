import Sequelize from 'sequelize'
import pg from 'pg'
import c from 'chalk'
import _ from 'lodash'
import sqlFormatter from 'sql-formatter'
import to from 'await-to'

delete pg.native

export async function connect() {
  const host = process.env.DB_HOST || 'localhost'
  const password = process.env.DB_PASSWORD || 'postgres'
  const user = process.env.DB_USERNAME || 'postgres'
  const name = process.env.DB_NAME

  await createDbIfNotExists({name, user, password, host})

  const database = new Sequelize(name, user, password, {
    host,
    dialect: 'postgres',
    dialectModule: pg,
    logging: process.env.SQL_LOGGING ? logger : false,
  })

  function logger(a) {
    console.log(c.gray(sqlFormatter.format(a)))
    console.log(_.times(80, () => '-').join(''))
  }

  return database
}

async function createDbIfNotExists({name, user, password, host}) {
  const {Client} = pg
  const client = new Client()
  await client.connect()
  const [err, res] = await to(client.query(`CREATE DATABASE ${name}`))
  if (err && !~err.message.indexOf('already exists')) {
    console.log('Database exists.')
  } else {
    console.log('Database created.')
  }
}
