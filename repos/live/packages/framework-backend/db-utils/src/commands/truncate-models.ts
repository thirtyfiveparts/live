import {deleteTables} from '@src/util/truncate-tables'

export default async function deleteSequelizeTables({sequelize, config}) {
  //const exclude = ['companies']
  const exclude = []
  const additional = ['sequelize_meta', 'sequelize_meta_migrations']
  let tables = Object.entries(sequelize.models)
    .map(([name, model]) => {
      const tableName = model.getTableName().toString()
      if (exclude.includes(tableName)) return
      return tableName
    })
    .filter(Boolean)
  tables.push(...additional)

  // TODO: `config` only contains options that sequelize could parse.
  //   We should pass in a plain config object intead.
  config.user = config.username // For knex.

  await deleteTables(config, tables)
  //await truncate(config, tables)
}
