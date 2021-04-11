import Knex from 'knex'

export function getKnex(config) {
  const knex = Knex({
    client: 'pg',
    connection: config,
  })
  return knex
}

export async function truncate(config, tables) {
  const knex = getKnex(config)
  for (const table of tables) {
    await knex.raw(`truncate table "${table}" cascade;`)
  }
}

export async function deleteTables(config, tables) {
  try {
    const knex = getKnex(config)
    await knex.raw('SET session_replication_role = \'replica\';')
    for (const table of tables) {
      const q = `DROP TABLE if exists ${table} cascade;`
      await knex.raw(q)
    }
    await knex.raw('SET session_replication_role = \'origin\';')
  } catch (e) {
    console.log(e)
    throw new Error(e)
  }
}

//
//function seed() {
//  return Promise.each(tables, function (table) {
//    return knex(table).insert(require('./seeds/' + table))
//  })
//}
