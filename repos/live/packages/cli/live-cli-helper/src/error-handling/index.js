module.exports = () => {

  // `self.context.Error.prepareStackTrace`?
  // https://github.com/nodejs/node/issues/21574#issuecomment-401193636

  //Error.stackTraceLimit = 10; // default

  // WORKS!!!
  // TODO(vjpr): Print links.
  //Error.prepareStackTrace = (error , stack) => {
  //  return 'foo'
  //}
  //throw new Error('foo')

  /*
  See https://github.com/v8/v8/wiki/Stack-Trace-API
  * Error.captureStackTrace(error, constructorOpt)
  adds a stack property to the given error object that will yield the stack trace at the time captureStackTrace was called. Stack traces collected through Error.captureStackTrace are immediately collected, formatted, and attached to the given error object.
  * */


  // Tricks to get async stack traces.

  // Think babel-runtime already includes this.
  //require('source-map-support').install({
  //     environment: 'node',
  // })

  //if (process.env.NODE_ENV !== 'production') {
  //  require('longjohn')
  //}

  ////////////////////

  //var stackman = require('stackman')()
  //
  //var err = new Error('Oops!')
  //
  //stackman.callsites(err, function (err, callsites) {
  //  if (err) throw err
  //
  //  callsites.forEach(function (callsite) {
  //    console.log('Error occured in at %s line %d',
  //      callsite.getFileName(),
  //      callsite.getLineNumber())
  //  })
  //})

  ////////////////////

  // If we want long stack traces for promise stuff in our code.
  // Won't work for transpiled code I don't think.
  //global.Promise = require('bluebird')
  //Promise.config({longStackTraces: true})

  ////////////////////////////////////////////////////////////////////////////////

  // async_hooks and perf_hooks

  // https://github.com/davidmarkclements/async-tracer

  //const {performance} = require('perf_hooks')
  //performance.mark('A')
  //setTimeout(() => {
  //  performance.mark('B')
  //  performance.measure('A to B', 'A', 'B')
  //  const entry = performance.getEntriesByName('A to B', 'measure')
  //  console.log(entry.duration)
  //}, 10000)

  ////////////////////////////////////////////////////////////////////////////////

  //const prettyError = require('pretty-error')
  //PrettyError.start()
  //
  //function makeError() {
  //  const PrettyError = require('pretty-error') // TODO(vjpr): May to many requires!
  //
  //  const pe = new PrettyError
  //
  //  // TODO: Workaround until RenderKid config can be passed to PrettyError.
  //  //pe._renderer = new RenderKid({layout: {terminalWidth: 300}})
  //  //pe._renderer.style(pe._style)
  //  // --
  //
  //  pe.skipNodeFiles()
  //  pe.skipPackage('babel-core', 'core-js', 'bluebird')
  //  pe.filter((traceLine, lineNumber) => {
  //    if (traceLine.shortenedAddr)
  //      traceLine.shortenedAddr = `idea://open?file=${traceLine.path}&line=${traceLine.line}:${traceLine.col}`
  //  })
  //
  //  //pe.appendStyle({
  //  //  'pretty-error > trace > item > footer > addr': {
  //  //    display: 'none'
  //  //  },
  //  //})
  //
  //  return pe
  //}

  ////////////////////////////////////////////////////////////////////////////////

  //const cleanStack = require('clean-stack')

  ////////////////////

  //require('cute-stack')()

}
