// TODO(vjpr): Why didn't npm-check find these missing! Did it search upwards or something?
import instructions from './instructions'
import _ from 'lodash'
import takeWhile from 'take-while'
import findUp from 'find-up'
import path, {join} from 'path'
import fs from 'fs'
//import makeError from 'make-error'

// TODO(vjpr): This isn't working in wallaby!
//const CustomError = makeError('custom-error')

export default class Dockerfile {
  // NOTE: Class members must be listed in constructor so they are not handled as "magic vars".
  steps = []

  static customInstructions = []

  constructor(opts = {}) {
    // win or linux or macos.
    // Because some features are only available in linux.
    const {targetOS, name} = opts

    // Don't wrap these methods.
    const classMembers = ['steps'] // TODO(vjpr): Surely there is a better way. I'm not liking this.
    const origClassProps = Object.getOwnPropertyNames(Dockerfile.prototype)
      .concat(classMembers)
      // We need `then` because `await` calls `then` on the return value.
      // See: https://stackoverflow.com/questions/48318843/why-does-await-trigger-then-on-a-proxy-returned-by-an-async-function
      .concat(['then'])

    const proxy = new Proxy(this, {
      get(target, propKey) {
        // Class props.
        if (origClassProps.includes(propKey)) {
          return target[propKey]
        }

        // TODO(vjpr): Perhaps we should enforce `dockerfile.custom.foo()` for custom comands so its easy to see which ones are not core.
        // Defined in instructions.
        const allInstructions = _.merge(
          instructions,
          Dockerfile.customInstructions,
        )
        if (propKey in allInstructions) {
          return (...args) => {
            const opts = args[0]
            const name = _.lowerCase(propKey) // Lowercase just to be on the safe side.
            // `fn` is actually an intruction renderer.
            const fn = allInstructions[propKey]
            if (!opts) throw new Error('Must pass in opts')
            const ret = fn(...args)

            ////////////////////
            // This is if the `opts` passed in is not in a Model format.
            // We need to filter instructions later so we need a consistent Model format.
            // TODO(vjpr): We will migrate to this I think.
            //   Allows us to handle strange arg patterns.
            // ['ENV foo=bar', {foo: 'bar'}]
            let str
            let model
            if (_.isArray(ret)) {
              str = ret[0]
              model = ret[1]
            } else {
              str = ret
              model = opts
            }
            ////////////////////

            // Our instructions return strings. We want to return Instruction objects.
            // This allows us to filter our steps as objects.
            const ins = {name, str, model, fn}
            proxy.steps.push(ins)
            return proxy
          }
        }

        // Not in instructions.
        return (...args) => {
          if (typeof propKey === 'symbol') return proxy
          const opts = args[0]
          const insArgs = _.isPlainObject(opts) ? opts.str : opts
          const str = _.toUpper(`${propKey}`) + ' ' + insArgs
          const ins = {name: propKey, str, args}
          target.steps.push(ins)
          return proxy
        }
      },
    })

    return proxy
  }

  render() {
    this.check()
    return this.steps.map(s => s.str).join('\n')
  }

  // builder is this class.
  // Merge builder instance with this one.
  concat(builder) {
    this.steps.push(...builder.steps)
    return this
  }

  // By default, writes to a temp directory.
  write(name) {
    if (!name) throw new Error('Must pass a name')
    // TODO(vjpr): Handle wallaby case - we want to use the actual repo root.
    let repoRoot = require('path').dirname(findUp.sync('pnpm-workspace.yaml'))
    const dockerfileRoot = join(repoRoot, 'tmp', 'docker-monorepo')
    // TODO(vjpr): Add `.generated` to name.
    const dest = join(dockerfileRoot, name)
    fs.writeFileSync(dest, this.render())
  }

  check() {
    onlyArgCanComeBeforeFirstFrom(this.steps)
    fromTagArgMustBeInScope(this.steps)
  }

  static custom(cmds) {
    Object.entries(cmds).map(([k, v]) => {
      Dockerfile.customInstructions[k] = v
    })
  }
}

////////////////////////////////////////////////////////////////////////////////

// Add default extensions.
// E.g. apkAdd.

import extensions from './extensions'
Dockerfile.custom(extensions)

////////////////////////////////////////////////////////////////////////////////

// Checks

function fromTagArgMustBeInScope(steps) {
  const fromInstructions = steps
    .map((v, i) => [v, i])
    .filter(([ins, i]) => ins.name === 'from')

  let lastFromIdx
  fromInstructions.map(([from, idx]) => {
    const fromScopeInstructions = steps.slice(lastFromIdx, idx)
    if (from.model.tagArg) {
      const valid = fromScopeInstructions.filter(
        i => i.name === 'arg' && i.model[from.model.tagArg],
      ).length
      if (!valid)
        throw new Error(`ARG not defined but used in FROM instruction`)
    }
    lastFromIdx = idx
  })
}

function instructionsBeforeFrom(steps) {
  return takeWhile(steps, ins => ins.name !== 'from')
}

// Only ARG can come before first FROM.
// https://docs.docker.com/engine/reference/builder/#understand-how-arg-and-from-interact
function onlyArgCanComeBeforeFirstFrom(steps) {
  const nonCommentsBeforeFrom = instructionsBeforeFrom(steps).filter(
    ins => !['arg', 'comment', 'heading'].includes(ins.name),
  ).length
  if (nonCommentsBeforeFrom) {
    // TODO(vjpr): Show more details.
    throw new Error(
      `ARG is the only instruction that may precede FROM in the Dockerfile`,
    )
  }
}
