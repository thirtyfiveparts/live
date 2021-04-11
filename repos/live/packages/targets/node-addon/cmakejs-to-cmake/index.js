const yargsParser = require('yargs-parser')

module.exports = (cmakeSourceDir) => {

  // a. Using CLI instead of API:
  const childProcess = require('child_process')
  const res = childProcess.spawnSync('cmake-js', ['print-configure', '--debug'], {cwd: cmakeSourceDir, encoding: 'utf-8'})
  const {stdout} = res
  const cmdStr = stdout
  handleCmdStr(cmdStr)

  ////////////////////////////////////////////////////////////////////////////////

  // b. Using API.
  // $ cmake-js print-configure --debug
  //const commandTest = `cmake "/Users/Vaughan/dev-mono/thirtyfive/repos/live/packages/app-templates/node-addon-cmake" --no-warn-unused-cli -G"Ninja" -DCMAKE_JS_VERSION="6.1.0" -DCMAKE_BUILD_TYPE="Release" -DCMAKE_LIBRARY_OUTPUT_DIRECTORY="/Users/Vaughan/dev-mono/thirtyfive/repos/live/packages/app-templates/node-addon-cmake/build/Release" -DCMAKE_JS_INC="/Users/Vaughan/.cmake-js/node-x64/v14.2.0/include/node" -DCMAKE_JS_SRC="" -DNODE_RUNTIME="node" -DNODE_RUNTIMEVERSION="14.2.0" -DNODE_ARCH="x64" -DCMAKE_CXX_FLAGS="-D_DARWIN_USE_64_BIT_INODE=1 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -DBUILDING_NODE_EXTENSION" -DCMAKE_SHARED_LINKER_FLAGS="-undefined dynamic_lookup"`

  //const {BuildSystem} = require('cmake-js')
  //const bs = new BuildSystem()
  //bs.getConfigureCommand().then(cmdStr => {
  //  handleCmdStr(cmdStr)
  //})

  ////////////////////////////////////////////////////////////////////////////////

  function handleCmdStr(cmdStr) {
    const argv = yargsParser(cmdStr, {
      configuration: {'short-option-groups': false},
    })
    const {DCMAKE_JS_INC, DCMAKE_JS_LIB, DCMAKE_LIBRARY_OUTPUT_DIRECTORY} = argv
    let out = []
    out.push(DCMAKE_JS_INC)
    out.push(DCMAKE_JS_LIB ?? '')
    out.push(DCMAKE_LIBRARY_OUTPUT_DIRECTORY)
    // Trailing `;` is to avoid the `{}` added to the end of the output in cmake.
    const outStr = out.join(';') + ';'
    process.stdout.write(outStr)
  }

}
