import untildify from 'untildify'
import path, {join} from 'path'
import fs from 'fs-extra'
import _ from 'lodash'

export default class CommandHistory {

  constructor() {
    const configDir = untildify('~/.config/live/')
    this.filePath = join(configDir, 'command-history')
    fs.ensureFileSync(this.filePath, 'utf8')
  }

  // PERF: When commands gets very big this could be slow.
  read() {
    const commandContents = fs.readFileSync(this.filePath, 'utf8')
    const commands = _.trim(commandContents).split('\n')
    return _.last(commands)
  }

  write(data) {
    fs.appendFileSync(this.filePath, data)
  }

}
