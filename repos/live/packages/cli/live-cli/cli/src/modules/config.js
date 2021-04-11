import path, {join} from 'path'
import getConfig from 'tools.config'

export default function readConfig({repoRoot}) {
  const config = require(path.join(repoRoot, 'live.config.js'))
  return config || {}
  //const config = getConfig('live')
  //return config

}
