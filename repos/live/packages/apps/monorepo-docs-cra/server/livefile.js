export default function(runnerOpts) {
  const {
    run,
    nodeApp,
    repoPkgScript,
    repoPkgBin,
    help,
    repoRoot,
    projectRoot,
  } = runnerOpts

  return {
    foobar: () => {
      run('nodemon index.js')
    }
  }
}
