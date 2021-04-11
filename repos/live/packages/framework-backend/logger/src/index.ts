import sqlFormatter from 'sql-formatter'
import path, {join} from 'path'
import Debug from 'debug'
const debug = Debug('debug')

class Logger {
  info(...args) {
    console.log(...args)
  }
  log(...args) {
    console.log(...args)
  }
  sql(...args) {
    console.log(sqlFormatter.format(...args))
  }
}

const logger = new Logger()

export default logger
