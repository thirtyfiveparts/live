import {join} from 'path'
import fse from 'fs-extra'
import userHome from 'user-home'

export function setupLogging(): any {
  const combine = true
  const {outFile, errFile, logFile} = getLogPaths()
  fse.ensureFileSync(outFile)
  fse.ensureFileSync(errFile)
  const outStream = fse.openSync(combine ? logFile : outFile, 'a')
  const errStream = fse.openSync(combine ? logFile : errFile, 'a')
  return {outStream, errStream}
}

export function getLogPaths(): any {
  const logDir = join(userHome, '.live/logs')
  const files = {
    outFile: join(logDir, 'out.log'),
    errFile: join(logDir, 'err.log'),
    logFile: join(logDir, 'log.log'),
  }
  return files
}
