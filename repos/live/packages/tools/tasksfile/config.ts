import {cli, sh, rawArgs} from 'tasksfile'

import {cypressRun as run, cypressOpen as open} from '@live/cypress'

function hello() {
  console.log('hi')
}

async function cypressRun(opts) {
  console.log({opts})
  await run()
}

async function cypressOpen(opts) {
  console.log({opts})
  await open()
}

cli({
  hello,
  cypressRun,
  cypressOpen,
})
