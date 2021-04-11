import yargsParser from 'yargs-parser'
import minimist from 'minimist'

export function parseCliFlags(pargv, opts) {
  const yargsParserOpts = {
    //'--': true, // TODO(vjpr): Not working, but `populate` does the same.
    configuration: {
      'populate--': true,
      'halt-at-non-option': true,
    },
    ...opts
  }
  // arg 1 = node
  // arg 2 = <script file>
  const argv = yargsParser(pargv, yargsParserOpts)
  //console.log({argv})
  // --
  //const margv = minimist(pargv, {'--': true, stopEarly: true, boolean: ['c']})
  // --
  return argv
}

export function parseArgs(pargv, opts) {
  const yargsParserOpts = {
    configuration: {
      'populate--': true,
    },
    ...opts,
  }
  // arg 1 = node
  // arg 2 = <script file>
  const argv = yargsParser(pargv, yargsParserOpts)
  return argv
}

export function parseArgsHalt(pargv, opts) {
  const yargsParserOpts = {
    configuration: {
      'halt-at-non-option': true,
    },
    ...opts,
  }
  // arg 1 = node
  // arg 2 = <script file>
  const argv = yargsParser(pargv, yargsParserOpts)
  return argv
}

