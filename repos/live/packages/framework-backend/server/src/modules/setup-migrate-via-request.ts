// Expose endpoint to allow migrating via an API request.

import {seedReplant} from '@live/migrate/src/actions/replant'

export default async function setupMigrateViaRequest({app, db, migrator, initDb}) {

  const airtableScoutId = 'recqOpTokXGumDFIT'

  // We call this from Cypress e2e testing to reset the database before a test run.
  app.post('/debug-reset', async (req, res) => {
    return reset({req, res, app, db, migrator, initDb, airtableScoutId})
  })

  //app.post('/sync', async (req, res) => {
  //  return reset({req, res, app, db, migrator, initDb, airtableScoutId})
  //})

}

async function reset({req, res, app, db, migrator, initDb, airtableScoutId}) {
  if (process.env.NODE_ENV === 'production') return res.sendStatus(404)
  const shouldSeed = false
  const config = {
    migrator,
    initDb,
  }
  const seedConfig = {
    // Only seed the first scout.
    //numScouts: 1,
    // This is a demo scout connected to user `vaughan@thirtyfive.dev`.
    airtableScoutId,
  }
  await seedReplant({db, shouldSeed, seedConfig}, config)
  res.sendStatus(200)
}
