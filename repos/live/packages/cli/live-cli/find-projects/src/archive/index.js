//import {getLivefileSources, collectCommands} from '../livefile'
//
//export async function resolveCmd({project, cmd, repoRoot, ctx}) {
//  // TODO(vjpr): We should locate the command instead.
//  await tryRunCommandInEachSource({project, cmd, repoRoot, ctx, appType})
//}
//
//async function tryRunCommandInEachSource({project, cmd, repoRoot, ctx, appType}) {
//  const sources = getLivefileSources({project, cmd, repoRoot, ctx, appType})
//
//  for (const source of sources) {
//    // We try to run our command in each source.
//    const res = await source.fn({name: source.name, p: source.p})
//    if (res) return res
//  }
//}
