#!/usr/bin/env node

const findUp = require('find-up')
const found = findUp.sync('pnpm-workspace.yaml')
const repoRoot = require('path').dirname(found)
console.log({repoRoot})

const concurrently = require('concurrently')
concurrently(
  [
    // CRA webpack-dev-server.
    'npm:watch-cra',
    // Generates types from server.
    // TODO(vjpr): We only need this run once for the whole codebase...
    //   What happens if we run it twice...bad things.
    // TODO(vjpr): Throw a notifcation if the build fails - its hard to know otherwise!
    //`npm run --prefix=${repoRoot} graphql-codegen:watch`,
  ],
  {
    prefix: 'name',
  },
).then(
  () => {
    console.log('Success')
  },
  () => {
    console.log('Failure')
  },
)
