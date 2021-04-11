import _ from 'lodash'
import listTables from '@src/util/list-tables'
import Knex from 'knex'

export default async function cleanDb({
  db,
  knex,
  databaseName,
  shouldDropExtensions,
}) {
  // TODO(vjpr): Creating postgis extension is slow...about 2s.
  // So we don't want to drop extensions all the time I don't think.
  // Should be a force command.
  // `deleteAllTables` will fail if we don't drop postgis though.
  // We should ignore postgis tables.
  // `error: cannot drop table spatial_ref_sys because extension postgis requires it`
  shouldDropExtensions = false
  if (shouldDropExtensions) await dropExtensions({db, knex, databaseName})
  await deleteAllTables({db, knex})
}

////////////////////////////////////////////////////////////////////////////////

async function dropExtensions({db, knex, databaseName}) {
  // Ignore 'plpgsql'
  const res = await knex
    //.withSchema(database)
    .select('*')
    .from('pg_available_extensions')
  const toDrop = _(res)
    .filter(e => e.installedVersion !== null && e.name !== 'plpgsql')
    .map('name')
    .value()
  console.log({toDrop})
  for (const ext of toDrop) {
    const [rows, data] = await db.query(`DROP EXTENSION IF EXISTS "${ext}" CASCADE`)
  }
}

export async function deleteAllTables({db, schemas = [], knex}) {
  const tables = await listTables(db, schemas)
  for (const table of tables) {
    const {tablename, schemaname} = table

    // TODO(vjpr): Remove.
    // Cannot remove this table before removing the postgis extension.
    // It is the only table that postgis creates.
    if (tablename === 'spatial_ref_sys') continue

    // NOTE: Not using because we want to use cascade.
    //await knex.schema.dropTableIfExists(tablename)

    for (const table of tables) {
      // TODO(vjpr): Get schema
      const query = `DROP TABLE IF EXISTS "${schemaname}"."${tablename}" CASCADE;`
      const [rows, data] = await db.query(query)
    }

  }
}
