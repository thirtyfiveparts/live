import 'reflect-metadata'
import api from './api'

export default async function getApp({logger, sequelize, knex}) {

  const server = await api({sequelize, knex, logger})

  return server
}
