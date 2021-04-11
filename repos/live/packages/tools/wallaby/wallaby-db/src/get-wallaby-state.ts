//import shortId from 'shortid'
export default function getWallabyState() {
  //const id = shortId.generate()
  const workerId = global.wallabyWorkerId
  const sessionId = global.wallabySessionId
  const isWallabyRunning = process.env.WALLABY
  return {workerId, sessionId, isWallabyRunning}
}

export function isWallaby() {
  const {isWallabyRunning} = getWallabyState()
  return isWallabyRunning
}
