if (process.env.ENABLE_CONSOLE_CALLER_IN_TESTS) {
  console.log('Console calls are intercepted and will print their paths. See:', __filename)
  // For showing the caller location of `console.log` statements.
  const stackOffset = undefined // For zog logging lib - change the value.
  require('console-caller')(global.console, stackOffset)
}

//console.log('Instantiating @babel/register for ava tests')

require('@babel/register')({
  ignore: [
    /node_modules/,
    // DEBUG
    //(f) => {
    //  console.log({f})
    //},
  ],
  configFile: true,
  babelrc: true,
  babelrcRoots: ['.', 'repos/**'],
  extensions: ['.ts', '.js'],
})
