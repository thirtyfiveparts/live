import {
  listProjects,
} from '@live/cli-core/src/printers'

import findProjects from '@live/find-projects'

export default async function handleList({config, cwd}) {
  const projects = await findProjects({config, cwd})
  listProjects({projects, config, cwd})
}
