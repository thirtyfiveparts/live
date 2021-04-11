import fs from 'fs'
import path, {join} from 'path'

// PERF: Loading `babel/register` will slow things down.
// TODO(vjpr): Maybe we could ignore some things?
// Run user's custom babel file so that livefile's can use babel.
export default function initBabelRegister({cwd}) {

  // TODO(vjpr): We should not run @babel/register twice!
  //   If we are running `live` we are already running it.
  //   This is only needed if we are using `lives` - the es5 version because it will need to read an Babel livefile.

  // TODO(vjpr): Check this.
  const isBabelRegisterAlreadyRequired = global.__babelRegisterRequired__
  if (isBabelRegisterAlreadyRequired) {
    return
  }

  const p = path.join(cwd, 'livefile.babel-register.js')
  if (fs.existsSync(p)) require(p)
}
