import {DependencyResolver} from 'jest-resolve-dependencies'
import path, {join} from 'path'
import {makeProjectConfig} from '@jest/test-utils'
import type {Config} from '@jest/types'
import {tmpdir} from 'os'
import {buildSnapshotResolver} from 'jest-snapshot'

export default async function haste() {

  const cwd = process.cwd()

  const config = makeProjectConfig({
    cacheDirectory: path.resolve(tmpdir(), 'jest-resolve-dependencies-test'),
    moduleDirectories: ['node_modules'],
    moduleNameMapper: [['^\\$asdf/(.*)$', '<rootDir>/$1']],
    rootDir: '.',
    roots: ['./packages/jest-resolve-dependencies'],
  })

  const Runtime = require('jest-runtime').default

  const maxWorkers = 1

  const runtimeContext = Runtime.createContext(config, {
    maxWorkers,
    watchman: false,
  })
  const runtimeContextResolver = runtimeContext.resolver
  const dependencyResolver = new DependencyResolver(
    runtimeContext.resolver,
    runtimeContext.hasteFS,
    buildSnapshotResolver(config),
  )
}
