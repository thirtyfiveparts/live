export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createSchema('core')
    await queryInterface.createSchema('target')
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropSchema('core')
    await queryInterface.dropSchema('target')
  },
}
