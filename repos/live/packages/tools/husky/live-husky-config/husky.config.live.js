const dotenv = require('dotenv').config()

////////////////////////////////////////////////////////////////////////////////

// Always run

const alwaysRunHooks = {
  // `git-lfs` compatability.
  // From: https://github.com/typicode/husky/issues/108#issuecomment-552868738
  ...setupLfs(),
}

////////////////////////////////////////////////////////////////////////////////

if (parseInt(process.env.SKIP_GIT_HOOKS)) {
  console.error('Skipping git hooks because of env var')
  return {hooks: alwaysRunHooks}
}

////////////////////////////////////////////////////////////////////////////////

module.exports = {
  hooks: {
    // commitlint is overkill and it is not easily customizable.
    //'commit-msg': 'commitlint -E HUSKY_GIT_PARAMS',
    'pre-commit': 'lint-staged',

    ...alwaysRunHooks,
  },
}

function setupLfs() {
  const hooks = ['post-checkout', 'post-commit', 'post-merge', 'pre-push']
  const gitLfsHooksPath = require('./git-lfs-hooks/dirname')
  return hooks.reduce((acc, name) => {
    return acc[
      name
    ] = `cross-env-shell echo $HUSKY_GIT_STDIN | cross-env-shell sh ${gitLfsHooksPath}/${name} $HUSKY_GIT_PARAMS`
  }, {})
}
