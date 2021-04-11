import {join} from 'path'
import fse from 'fs-extra'
import _ from 'lodash'
import {getWorkspacePackages} from '@live/get-workspace-pkgs'
//eslint-disable-next-line node/no-extraneous-import
import {printSchema} from 'graphql'

// TODO(vjpr): We should use a different schema package - `backend.schema` is more designed for the cloud server.
//   Maybe we need to look at stitching.
// For type support.

export async function writeSchemaToDisk(schema, pkgName) {
  const sdl = printSchema(schema)
  const pkgs = await getWorkspacePackages()
  const schemaPkg = _.find(pkgs, p => p.manifest.name === pkgName)
  const dest = join(schemaPkg.dir, '/schema.graphql')
  await fse.writeFileSync(dest, sdl)
  console.log('Writing:', dest)
}

//async function writeSchemaToDisk(schema) {
//  const sdl = printSchema(schema)
//  const pkgName = '@sidekicks/backend.schema'
//  const pkgs = await getWorkspacePackages()
//  const schemaPkg = _.find(pkgs, p => p.manifest.name === pkgName)
//  const dest = join(schemaPkg.dir, '/schema.graphql')
//  await fse.writeFileSync(dest, sdl)
//}
