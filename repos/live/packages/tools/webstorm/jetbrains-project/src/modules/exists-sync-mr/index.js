import fs from 'fs'

export default function existsSync(p) {
  try {
    fs.statSync(p)
  } catch (err) {
    if (err.code == 'ENOENT') return [null, false]
    // TODO(vjpr): Pass this back and handle it.
    return [err]
  }
  return [null, true]
}
