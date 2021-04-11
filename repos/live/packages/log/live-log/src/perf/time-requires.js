// TODO(vjpr): Add browser support. Cannot use `module` in browser environment.

if (!process.env.BROWSER) {

  const {performance, PerformanceObserver} = require('perf_hooks')
  const mod = require('module')

  // Monkey patch the require function
  mod.Module.prototype.require = performance.timerify(
    mod.Module.prototype.require,
  )
  require = performance.timerify(require)

  // Activate the observer
  const obs = new PerformanceObserver(list => {
    const entries = list.getEntries()
    const sortedEntries = entries.sort((a, b) => a.duration - b.duration)
    sortedEntries.forEach(entry => {
      const request = entry[0]
      console.log(`require('${request}')`, entry.duration)
    })
    obs.disconnect()
  })
  obs.observe({entryTypes: ['function'], buffered: true})

}
