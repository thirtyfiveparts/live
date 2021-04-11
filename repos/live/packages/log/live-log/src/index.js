import DebugEnv from 'debug-env'
import Debug from 'debug'

// TODO(vjpr): Perf needs to be browser safe. Need to use browser field in package.json.
// Added webpack config: `externals = {perf_hook: 'window'}`
import perf, {perfStart, perfEnd, perfConfig} from './perf'

// TODO(vjpr): Add `-v` to show some default logging settings.

export function updateLoggerEnv(val) {
  if (val !== undefined) { // TODO(vjpr): Is this correct?
    // TODO(vjpr): Find a way to hide this...or maybe only show if it changes.
    //   Need to get the current env from `debug`.
    console.log(`Updating 'DEBUG=' to:`, val)
    Debug.enable(val)
  }
}

export default function(...args) {
  //return Debug(...args)
  return DebugEnv(...args)
}

//export {Debug as DebugEnv, Debug}
export {DebugEnv, Debug}

export function log(...args) {
  console.log(...args)
}

export function warn(...args) {
  console.log(...args)
}

export function trace(...args) {
  console.log(...args)
}

export function info(...args) {
  console.log(...args)
}

export function debug(...args) {
  console.log(...args)
}

export function fatal(...args) {
  console.log(...args)
}

export function error(...args) {
  console.log(...args)
}

export function time(...args) {
  console.time(...args)
}

export function timeEnd(...args) {
  console.timeEnd(...args)
}

// TODO(vjpr): Make this a babel macro using comments instead.

// Alternative perf api.
// step(() => { doSomething() }, 'time for doing something')
// Time a step.
// TODO(vjpr): wip
export function step(fn, desc) {
  if (fn.then) {
    console.warn('Please use stepAsync with async functions')
  }
  const perfEnd = perf(desc)
  const res = fn()
  perfEnd()
  return res
}

export async function stepAsync(fn, desc) {
  const perfEnd = perf(desc)
  const res = await fn()
  perfEnd()
  return res
}

export function timeRequires() {
  require('./perf/time-requires')
}

// Use if we need to disable it.
//function perf() {
//  return () => {}
//}

global.perf = perf

perf.start = perfStart
perf.end = perfEnd
perf.config = perfConfig

// TODO(vjpr): Maybe separate perf into a separate package.
export {perf, perfStart, perfEnd}
