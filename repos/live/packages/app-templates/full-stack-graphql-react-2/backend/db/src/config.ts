import pg from 'pg'

const commonConfig = {
  dialect: 'postgres',
  // TODO(vjpr): Would be good to not need this here.
  dialectModule: pg,
}

const databases = {
  primary: {

    development: {
      ...commonConfig,
      host: 'localhost',
      port: 5432,
      database: 'sidekick_dev',
      username: 'postgres',
      password: 'postgres',
    },
    test: {
      ...commonConfig,
      host: 'localhost',
      port: 5432,
      database: 'sidekick_dev_test',
      username: 'postgres',
      password: 'postgres',
    },
    localProduction: {
      ...commonConfig,
      host: 'localhost',
      port: 5432,
      database: 'sidekick_prod',
      username: 'postgres',
      password: 'postgres',
    },
    // Connect to database running on same machine as app (i.e. when deployed to EC2 via SSH)
    remoteProductionEC2: {
      ...commonConfig,
      host: 'localhost',
      port: 5432,
      database: 'sidekick_prod',
      username: 'postgres',
      password: 'V93AZ.6dBz3*F',
    },
    remoteStaging: {
      ...commonConfig,
      // TODO(vjpr)
    },
    //remoteProduction: {
    //  ...commonConfig,
    //  host: 'prod-data-rds.cejkhzb6bgbl.eu-central-1.rds.amazonaws.com',
    //  port: 5432,
    //  database: 'sources',
    //  username: 'crawler',
    //  password: 'mvaVH8dbwWUmGHRe',
    //  production: true,
    //},
  },
}

export default databases

// TODO(vjpr): We don't use anymore.
// NOTE: Must use `module.exports` for Sequelize CLI.

module.exports = databases

////////////////////////////////////////////////////////////////////////////////
