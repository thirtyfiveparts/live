import {Emitter} from 'event-kit'
import _ from 'lodash'
import {Observable} from 'rxjs'

export function handler(target, key, desc) {
  const fn = target[key]
  const eventName = _.kebabCase(key.replace(/^on/, ''))
  desc.value = function(...args) {
    fn()
    const cb = _.last(args)
    return this.emitter.on(eventName, cb)
  }
  return desc
}

// Only instantiates the observable when it is used.
export function observable(target, key, desc) {
  const eventName = _.kebabCase(key.replace(/\$$/, ''))
  const sourceName = eventName + 'Source'
  const {configurable, enumerable} = desc
  // NOTE: `desc.get = function() {}` did not work. Getter syntax stuff.
  return {
    configurable,
    enumerable,
    get() {
      target[sourceName] = target[sourceName] || Observable.fromEvent(this.emitter, eventName)
      return target[sourceName]
    },
  }
  return desc
}

export function handlerOnce(target, key, desc) {
  const fn = target[key]
  const eventName = _.kebabCase(key.replace(/^on/, ''))
  desc.value = function(...args) {
    fn()
    const cb = _.last(args)
    //const params = _.initial(args) // TODO(vjpr): Do we need this?
    const promise = new Promise((resolve, reject) => {
      const sub = this.emitter.on(eventName, (...params) => {
        sub.dispose()
        cb(...params)
        resolve()
      })
    })
    return promise
  }
  return desc
}

//export function emitter(target, key, desc) {
//  target.emitter = new Emitter
//}
