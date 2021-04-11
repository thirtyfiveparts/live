import path, {join} from 'path'
import Debug from 'debug'
const debug = Debug('debug')

export default function() {

  // Read configuration from project root.
  const configPath = join(process.cwd(), 'config.ts')
  const config = require(configPath).default
  debug(`Read config from ${configPath}`)
  debug(config)
  return config

}

export function getEnv(name) {
  return process.env[name]
}
