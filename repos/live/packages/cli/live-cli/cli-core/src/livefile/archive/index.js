//// We used to run the first function we find while looking in a prioritized way.
//// Now we read all the livefiles and functions, sort, then run.
//
//// TODO(vjpr): This should be renamed. We also use it for livefile's in the package.
////   Its just to avoid confusion and easily copying blocks around.
//async function tryCommandRoot(path, {cmd, source, appType, ctx}) {
//  let res
//  res = await tryCommand(path, {
//    cmd,
//    source: source + `#appType${appType}`,
//    sourceObj: {source, appType, configType: 'package'},
//    key: `appType${appType}`,
//    ctx,
//  })
//  if (res) return res
//  res = await tryCommand(path, {
//    cmd,
//    source: source + '#app',
//    key: 'app',
//    ctx,
//    sourceObj: {source, appType, configType: 'package'},
//  })
//  if (res) return res
//  res = await tryCommand(path, {
//    cmd,
//    source: source + '#package',
//    sourceObj: {source, appType, configType: 'package'},
//    key: 'package',
//    ctx,
//  })
//  if (res) return res
//  return null
//}
//
//
//// TODO(vjpr): Error handling.
//async function tryCommand(path, {cmd, key, source, sourceObj, ctx}) {
//  const livefile = tryLivefile(path, ctx)
//  debug('trying', path, key, cmd)
//  if (!livefile) return null
//  const fn = key ? livefile[key]?.[cmd] : livefile[cmd]
//  if (fn) return {fn, source, sourcePath: path, sourceObj}
//  return null
//}
