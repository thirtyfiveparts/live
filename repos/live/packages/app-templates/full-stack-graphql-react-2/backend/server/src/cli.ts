import Yargs from 'yargs'
import addIpToSecurityGroup from '@live/add-ip-to-security-group'
import {getCommands} from '@live/migrate'
import migrator from '@sidekicks/core.db/src/db-admin/migrate'
import {initDb} from '@sidekicks/core.db/src/connection'
import dbConfigModule from '@sidekicks/core.db/src/config'

// A simple cli that aggregates commands from our app.
export async function cli() {
  const repoRoot = process.cwd()

  const yargs = Yargs(process.argv.slice(2))
  //.command(migrateAddIndexToMasterStartups)

  // TODO(vjpr): Only reference migrator and initDb once from this app.
  const appConfig = {
    // Seed and migrator functions.
    migrator,
    initDb,
    dbConfigModule,
  }
  for (const command of getCommands(appConfig)) {
    yargs.command(command)
  }

  yargs.help().demandCommand().showHelpOnFail(true)

  yargs.argv
}

// App-specific commands
////////////////////////////////////////////////////////////////////////////////

const commandAddIpToSecurityGroups = {
  command: 'sgip',
  describe: 'addIpToSecurityGroups',
  builder: yargs => yargs.option('ip'),
  handler: async argv => {
    const {ip} = argv
    await addIpToSecurityGroup({ip})
  },
}

//const migrateAddIndexToMasterStartups = {
//  command: 'migrate:add-index-to-master-startups',
//  describe: 'Migrate',
//  builder: (yargs) => yargs.option('db'),
//  handler: async (argv) => {
//    const {db, direction} = argv
//    await addIndexToMasterStartups({db, direction})
//  },
//}

////////////////////////////////////////////////////////////////////////////////
