import Knex from 'knex'

export default async function listTables(db, schemas = []) {
  const query = Knex({client: 'pg'})
    .withSchema('pg_catalog')
    .select('tablename', 'schemaname')
    .from('pg_tables')
  // TODO(vjpr): OR

  if (schemas.length) {
    query.whereIn('schemaname', schemas)
  } else {
    query.whereNotIn('schemaname', ['information_schema', 'pg_catalog'])
  }

  const [rows, data] = await db.query(query.toString())
  return rows.map(t => {
    const {tabelname, schemaname} = t
    return t
  })
}
