import _ from 'lodash'
import getWallabyState, {isWallaby} from './get-wallaby-state'
import getAvaState, {isAvaCli} from './get-ava-state'

export default function getDatabaseName(dbConfig) {
  const {isWallabyRunning} = getWallabyState()
  if (isWallabyRunning) {
    return getDbName(dbConfig)
  }
  return getDatabaseNameFromConfig(dbConfig)
}

////////////////////////////////////////////////////////////////////////////////

export function getDatabaseNameFromConfig(dbConfig) {
  return dbConfig.database
  //return readConnectionFromKnexConfig(dbConfig).database
}

export function readConnectionFromKnexConfig(dbConfig) {
  if (_.isString(dbConfig.connection)) {
    const str = 'TODO: Extract from connstring.'
    console.error(str)
    throw str
  }
  const {connection} = dbConfig
  return connection
}

export function getDbName(dbConfig) {
  // TODO(vjpr): This may fail if `connection` is not an object but is a string.
  const {workerId, isWallabyRunning} = getWallabyState()
  const {database} = readConnectionFromKnexConfig(dbConfig)
  // Test: Wallaby
  // --------------------
  if (isWallaby()) {
    return `${database}_wallaby_w${workerId}`
  }

  // Test: Ava
  // --------------------
  if (isAvaCli()) {
    // Assume Ava cli test is running.
    // TODO(vjpr): Check properly somehow.

    // TODO(vjpr): Ava might need this if we try to do concurrency.
    //   But will end up with lots of junk dbs.
    //   Maybe allow a script to clean them all up at the end.
    //return `${database}_p${process.pid}`
    return database
  }

  // Development or Production
  // --------------------
  return database
}
