export default function({run}) {

  /*
    TODO(vjpr): Commands can be:
    - global
      - help
      - list
    - repo
      - common
        - install
      - custom
    - app
      - custom
        - each app can have its own commands
      - common
        - we should use npm run where we can...
        - apps can override common functions (start, test, stop, start-dev, etc.)
  */
  const out = {

    run({project}) {
      // TODO(vjpr):
      run('echo 1')
    },

    dev({project}) {
      // TODO(vjpr):
      run('echo 1')
    },

    // Commands for types of apps.
    // Type could be defined in pjson#live.type/group
    // E.g. `appTypeNextJs` to apply to all `next.js`-based apps.
    appTypeFoo: {

    },

    // Commands for apps.
    app: {

      dev() {
        console.log('hi dev')
      }

    },

    // Commands for packages (including apps?).
    package: {

    },

    // Commands for monorepo.
    repo: {

    },

  }

  out.run.description = 'Run your app TEST'
  out.dev.description = 'Dev your app TEST'

  return out

}
