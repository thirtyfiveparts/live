import to from 'await-to-js'
import dedent from 'dedent'

const vectorColName = '_search'

// NOTE: We need to quote index names because they may contain a dot because the schemified table name contains a dot.

async function runTransaction(sequelize, fn) {
  let q
  const query = sequelize.query.bind(sequelize)
  const transaction = await sequelize.transaction()
  const [err, res] = await to(fn({query, transaction}))
  if (err) {
    console.error(err)
    await transaction.rollback()
  }
  await transaction.commit()
}

export async function up(sequelize, searchFields) {
  await runTransaction(sequelize, run)

  async function run({query, transaction}) {
    for (const [table, columns] of Object.entries(searchFields)) {
      let q
      q = `ALTER TABLE ${table} ADD COLUMN ${vectorColName} TSVECTOR;`
      await query(q, {transaction})

      // eslint-disable-next-line quotes
      const cols = columns.join(" || ' ' || ")
      q = `UPDATE ${table} SET ${vectorColName} = to_tsvector('english', ${cols});`
      await query(q, {transaction})

      q = `CREATE INDEX "${table}_search" ON ${table} USING gin(${vectorColName});`
      await query(q, {transaction})

      q = dedent`
        CREATE TRIGGER "${table}_vector_update"
          BEFORE INSERT OR UPDATE ON ${table}
          FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger(
            ${vectorColName},
            'pg_catalog.english', 
            ${columns.join(', ')});
      `
      await query(q, {transaction})
    }
  }
}

export async function down(sequelize, searchFields) {
  await runTransaction(sequelize, run)

  async function run({query, transaction}) {
    for (const [table, columns] of Object.entries(searchFields)) {
      let q
      q = `DROP TRIGGER "${table}_vector_update" ON ${table};`
      await query(q, {transaction})
      q = `DROP INDEX "${table}_search";`
      await query(q, {transaction})
      q = `ALTER TABLE ${table} DROP COLUMN ${vectorColName};`
      await query(q, {transaction})
    }
  }
}

// 44 seconds
const foo = `
  CREATE MATERIALIZED VIEW master_startups_search_index AS 
  SELECT *,
         setweight(to_tsvector(master_startup.company_name), 'A') || 
           setweight(to_tsvector(master_startup.description), 'B') ||
           setweight(to_tsvector(master_startup.industry_tags), 'C')
           AS document
  FROM master_startup
`
