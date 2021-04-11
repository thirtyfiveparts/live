// Simple helper to wrap globals.
export function addWallabyTeardownTask(name, fn) {
  global.addKnexWallabyTeardownTask && global.addKnexWallabyTeardownTask(name, fn)
}

export default function addKnexWallabyTeardownTask(knex) {
  addWallabyTeardownTask('knex-destroy', () => {
    knex.destroy(() => {
      console.log('complete - teardown knex connection pool')
    })
  })
}
