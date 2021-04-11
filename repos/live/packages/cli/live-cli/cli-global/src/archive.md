  // Unref causes our main process to exit, which causes the terminal to
  //   print its prompt. If we are inheriting, this is a bad UX.
  //   But because we want to run in the background is fine.
  //if (shouldStartDaemon) {
  //  child.unref()
  //}



  const shouldStartDaemon = firstArg === 'daemon'
  if (shouldStartDaemon) {
    spawnArgs = {...spawnArgs, detached: true}
  }
