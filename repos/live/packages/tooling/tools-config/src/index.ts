import path, {join} from 'path'
import * as findUp from 'find-up'

// TODO(vjpr): Use a common function.
const repoRoot = path.dirname(findUp.sync('pnpm-workspace.yaml'))

export default async function(namespace) {
  // E.g. { live: async () => import('../live/live.config.js') }
  const rootConfigPath = join(repoRoot, 'tools.config.cjs')
  const configRoot = import(rootConfigPath)
  return configRoot[namespace]
}
