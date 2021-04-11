import findUp from 'find-up'
import path, {join} from 'path'
import globby from 'globby'
import _ from 'lodash'

export default async function findClosestIml({cwd} = {}) {
  cwd = cwd || process.cwd()

  // DEBUG
  //console.log(globby.sync('**', {cwd, dot: true}))

  // NOTE: We use find-up because it makes testing easier.
  const ideaPath = await findUp('.idea', {cwd})

  if (!ideaPath) {
    console.warn('No .idea dir found')
    return {}
  }

  const imlFiles = await globby(['*.iml'], {
    cwd: ideaPath,
    absolute: true,
  })
  let imlFile = _.first(imlFiles)
  if (imlFiles.length > 1) {
    console.warn('Multiple .iml files found.', {imlFiles})
    console.warn('Using:',  imlFile)
  }
  return {imlFile, ideaPath}
}

