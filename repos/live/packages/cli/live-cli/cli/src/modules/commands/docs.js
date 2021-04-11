import runNpmScript from '../runners/npm-script'

export async function handleDocsCommand({pargv, config, cwd, repoRoot}) {
  //console.log('TODO:')
  //console.log('live app monorepo-docs-cra-server run watch')
  //console.log('SKIP_PREFLIGHT_CHECK=true live app monorepo-docs-cra-client run start')

  const args = ''
  await runNpmScript('docs', args, {
    projectRoot: '.',
    config,
  })
}
