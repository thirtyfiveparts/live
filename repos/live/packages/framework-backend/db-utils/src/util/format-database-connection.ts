import {ConnectionString} from 'connection-string'

export default function formatDatabaseConnection(dbConfig) {
  const {database, username: user, password, host, port} = dbConfig
  //const conn = new ConnectionString({database, user, password, host, port})
  //const conn = new ConnectionString({database, user, password})
  //return conn.toString()
  return `${user}@${host}:${port}/${database}`
}
