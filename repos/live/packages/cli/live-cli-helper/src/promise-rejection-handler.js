const {spath, scode, spkg, sevt} = require('@live/log-style/es5')

module.exports = function setupPromiseRejectionHandler() {

  // NOTE: Use `hard-rejection`, or you won't find errors until you stop your app.
  // On unhandled promise rejection, immediately terminate process.
  require('hard-rejection')((...args) => {
    console.error(
      `${spkg('hard-rejection')} package found an ${sevt('unhandledRejection')} of a promise. Printing them here now that app has terminated:`,
    )
    console.error(...args)
  })

  ////////////////////

  // On unhandled promise rejection, report when process terminate.
  //require('loud-rejection')((...args) => {
  //  console.error(
  //    `'loud-rejection' package has earlier found an unhandledRejection of a promise. Printing them here now that app has terminated:`,
  //  )
  //  console.error(`Do they matter? I don't know.`)
  //  console.error(...args)
  //})

}
