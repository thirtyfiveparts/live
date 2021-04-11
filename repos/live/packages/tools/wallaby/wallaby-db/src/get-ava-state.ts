export function isAvaCli() {
  const {isWallabyRunning} = getWallabyState()
  return process.env.NODE_ENV === 'test' && !isWallabyRunning
}

// TODO(vjpr)
//export function getAvaState() {
//  const isAvaRunning = undefined
//  return {isAvaRunning}
//}
