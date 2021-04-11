import getWallabyState, {isWallaby} from './get-wallaby-state'
import getAvaState, {isAvaCli} from './get-ava-state'

// TODO(vjpr): What is the difference between these two?

export default function makeNameForPostgresDbPostgresConnection(projectName) {
  const {workerId, sessionId} = getWallabyState()
  return `${projectName} db=postgres workerId=${workerId}`
}

// TODO(vjpr): Maybe add package name too?
export function makeNameForPostgresConnection(projectName) {
  const {workerId, sessionId} = getWallabyState()
  const pid = process.pid
  const env = process.env.NODE_ENV || 'development'
  if (isWallaby()) {
    return `${projectName} env=${env} wallaby workerId=${workerId} sessionId=${sessionId} pid=${pid}`
  }
  if (isAvaCli()) {
    return `${projectName} env=${env} ava pid=${pid}`
  }
  return `${projectName} env=${env} pid=${pid}`
}
