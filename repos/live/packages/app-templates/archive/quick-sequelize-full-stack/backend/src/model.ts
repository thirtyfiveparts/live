import Sequelize from 'sequelize'
import short from 'short-uuid'

const S = Sequelize

const id = {
  allowNull: false,
  primaryKey: true,
  type: Sequelize.STRING, // Sequelize.UUID causing errors.
  defaultValue: () => short.uuid(),
}

export default async function ({database}) {
  const models = {}

  //const opts = {underscored: true, freezeTableName: true}
  const opts = {}

  const Thing = database.define(
    'thing',
    {
      id,
      name: S.STRING,
      description: S.TEXT,
      website: S.STRING,
    },
    opts,
  )

  return {Thing}

}
