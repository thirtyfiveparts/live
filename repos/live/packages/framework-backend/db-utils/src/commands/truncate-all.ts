import listTables from '../util/list-tables'
import _ from 'lodash'

export default async function truncateAllTables({databaseName, db}) {
  let tables = await listTables(db)
  if (!tables.length) {
    const err = {code: 'no-table', msg: 'There are no tables in this database'}
    console.warn(err.msg)
    return new Error(err)
  }
  const excludes = ['sequelize_meta', 'sequelize_meta_migrations']
  tables = _.without(tables, excludes)
  const tablesEsc = tables
    .map(table => {
      const {tablename, schemaname} = table
      return `"${schemaname}"."${tablename}"`
    })
    .join(', ')
  // https://www.postgresql.org/docs/9.1/static/sql-truncate.html)
  const query = `TRUNCATE ${tablesEsc} RESTART IDENTITY CASCADE`
  const [rows, data] = await db.query(query)
  // TODO(vjpr): `rowCount` not accurate.
  console.log('Truncated %d tables', data.rowCount)
  return data.rowCount
}
