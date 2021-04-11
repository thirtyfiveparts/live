export default function(val) {
  if (global.liveCliInteractive.inUse) {
    if (val === 1) {
      return false
    } else {
      return true
    }
  }
  process.exit(val)
}
