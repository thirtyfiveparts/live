import {promisify} from 'util'
import pify from 'pify'
import to from 'await-to'
import path, {join} from 'path'

import middleware from 'webpack-dev-middleware'

import express from 'express'

export default async function runWebpack() {

  const cwd = process.cwd()
  const root = getRepoRoot()

  const {default: webpack} = await import('webpack')

  const config = await getWebpackConfig({cwd, root})

  const compiler = webpack(config)

  await startDevServer(compiler)

  //await run(compiler)

}

async function startDevServer(compiler) {
  const app = express()
  app.use(middleware(compiler))
  app.listen(3000, () => {
    console.log('Listening!')
  })
}

async function run(compiler) {
  const runAsync = pify(compiler.run.bind(compiler))

  const [err, stats] = await to(runAsync())

  if (err) {
    throw err
  }

  //if (e) throw e
  if (stats.hasErrors()) {
    stats.toJson().errors.map(e => {
      console.log(e)
      console.log(
        '------------------------------------------------------------------------------',
      )
    })
    //return
    throw 'Webpack failed.'
  }

  const json = stats.toJson({modules: true})

}

////////////////////////////////////////////////////////////////////////////////

async function getWebpackConfig({cwd, root}) {
  const defaultFileName = join(cwd, 'tools/webpack/webpack.config.babel')
  const webpackConfig = await import(defaultFileName)
  return webpackConfig
}

function getRepoRoot() {
  const findUp = require('find-up')
  const path = require('path')
  const rootPath = findUp.sync('pnpm-workspace.yaml', {cwd: process.cwd()})
  const repoRoot = path.dirname(rootPath)
  return repoRoot
}
