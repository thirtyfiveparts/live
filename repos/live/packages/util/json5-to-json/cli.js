#!/usr/bin/env node

const fs = require('fs')
const JSON5 = require('json5')

const [file] = process.argv.slice(2)

const json = JSON5.parse(fs.readFileSync(file))
if (!json) process.exit(1)
const jsonStr = JSON.stringify(json, null, 2)

fs.writeFileSync(
  //file.replace(/\.json5$/, '.json'),
  file, // in-place overwrite.
  jsonStr,
)
