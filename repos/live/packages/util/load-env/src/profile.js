import path, {join} from 'path'
import fs from 'fs'
import dotenv from 'dotenv'
import _ from 'lodash'
import {prompt} from 'enquirer'

// Warning: live-cli-helper runs for live-cli too, and also the app its running.

export default async function({
  appRootTools,
  dotenvExamplePath,
  flag,
  interactiveFlag,
  baseFileName,
  flagName,
  isSimpleList, // File is not A=B, but just A.
}) {
  const dryRun = false

  let envPath
  let envExampleConfig

  //console.log({flag, interactiveFlag})

  if (flag) {
    // Use this .env file.
    const profileName = flag
  } else if (interactiveFlag) {
    // Edit this .env file.
    const profileName = interactiveFlag

    console.log(`Running interactive ${flagName}`)
    // TODO(vjpr): Let user select profile.
    //envPath = join(appRootTools, '.env')

    if (!fs.existsSync(appRootTools)) return

    let envs = fs.readdirSync(appRootTools)
    envs = envs
      .map(p => {
        let name
        // Rename `.env` to default.
        if (p === baseFileName) {
          name = 'default'
        } else if (p.startsWith(baseFileName + '.example')) {
          // TODO(vjpr): Don't let user select the example one.
          return null
        } else if (p.startsWith(baseFileName)) {
          // `.env.dev` -> `dev`
          name = p.replace(baseFileName + '.', '')
        } else {
          return null
        }
        // This path is useful for iTerm cmd+clicking.
        const repoRootRelPath = path.relative(
          process.cwd(),
          join(appRootTools, p),
        )
        // hint - show next to the option. disappears when you start typing in an input box.
        // message is what shows for option.
        return {
          name: p,
          value: p,
          message: name,
          hint: repoRootRelPath,
          disabled: false,
        }
      })
      .filter(Boolean)
    console.log({envs})

    let profile
    if (interactiveFlag !== true) {
      // A profile name is specified.
      // See if it exists.
      //console.log({envs}, interactiveFlag)
      const env = _(envs).find(env => env.value === interactiveFlag)
      profile = env.value
    } else {
      const choices = envs
      const res = await prompt([
        {
          type: 'select',
          name: 'profile',
          message: 'Choose a config file source',
          choices,
        },
      ])
      console.log({res})
      profile = res.profile
    }

    if (!profile) {
      console.log('No file selected.')
      process.exit(1)
    }

    envPath = join(appRootTools, profile)

    const envExampleConfig = parseEnvFile(dotenvExamplePath)

    const envStr = fs.readFileSync(envPath, 'utf8')

    const envConfig = isSimpleList
      ? readSimpleEnv(envStr)
      : dotenv.parse(envStr)

    //console.log({envConfig, envExampleConfig})

    // TODO(vjpr): Marge envConfig and envExampleConfig.
    const envVarChoices = Object.assign({}, envConfig, envExampleConfig)

    const selected = []
    let envChoices = Object.entries(envVarChoices).map(([k, v]) => {
      const {value, comment} = v
      let currentVal = envConfig[k]

      // TODO(vjpr): Parse env var.
      //if (Boolean(currentVal)) {
      //  selected.push({name: k})
      //}

      if (currentVal === '') {
        currentVal = null
      }

      return {
        name: k,
        message: k,
        hint: comment,
        initial: currentVal,
        value: currentVal,
        enabled: Boolean(currentVal),
      }
    })

    const resp = await prompt([
      {
        //type: 'multiselect',
        type: isSimpleList ? 'multiselect' : 'form',
        message: `Configure env vars for ${envPath}`,
        name: 'vars',
        choices: envChoices,
        limit: 20,
        //selected,
        //enabled: selected,
        //answers: selected,
        //focused: selected,
      },
    ])

    console.log(resp)

    // TODO(vjpr): Write to envConfig
    let newEnvStr

    // TODO(vjpr): Don't split this. We want to use the comment handling.
    if (!isSimpleList) {
      newEnvStr = updateEnvfileKeys(envPath, envStr, resp.vars)
    } else {
      const all = _.map(envChoices, 'name')
      const add = resp.vars
      const remove = _.difference(all, resp.vars)
      console.log({add, remove, all})
      newEnvStr = updateSimpleEnvfile(envPath, envStr, add, remove, all)
    }

    if (!dryRun) {
      console.log(`Writing '${envPath}' with changes`)
      fs.writeFileSync(envPath, newEnvStr)
    } else {
      console.log('dryrun', newEnvStr)
    }

    console.log({newEnvStr})
  }

  return envPath
}

function updateSimpleEnvfile(envConfig, envStr, add, remove, all) {
  let envLines = envStr.split('\n')

  for (const val of all) {
    const shouldAdd = add.includes(val)
    let replaced = false
    envLines = _(envLines)
      .map(line => {
        if (!line) return
        console.log({line})
        if (shouldAdd) {
          if (line.startsWith('#' + val)) {
            // Uncomment.
            replaced = true
            return val
          }
        } else {
          if (line.startsWith(val)) {
            // Uncomment.
            replaced = true
            return '#' + val
          }
        }
      })
      .value()
    if (!replaced && val !== '') {
      envLines.push(val)
    }
  }

  return envLines.join('\n')
}

// Modifies the file in-place instead of rewriting it to maintain comments.
function updateEnvfileKeys(envConfig, envStr, vars) {
  let envLines = envStr.split('\n')

  for (const [k, v] of Object.entries(vars)) {
    let replaced = false
    envLines = _(envLines)
      .map(line => {
        // Replace existing.
        if (line.startsWith(k + '=')) {
          replaced = true
          return k + '=' + v
        }
        return line
      })
      .value()
    if (!replaced && v !== '') {
      envLines.push(k + '=' + v)
    }
  }

  return envLines.join('\n')
}

//envStr.replace(/^((${k})(.*)\n)$/) // I don't think template literals work.

// TODO(vjpr): Use comment (with a space after hash) above the value as the description.
function parseEnvFile(p) {
  if (!fs.existsSync(p)) {
    return
  }
  // Cannot read commented stuff. We want to use the example file as
  //   a definition file.
  // TODO(vjpr): Although maybe we should do this elsewhere. In an `.env.example.js` file.
  //envExampleConfig = dotenv.parse(f)
  // --
  const envArr = parseEnvStrToArray(fs.readFileSync(p, 'utf8'))

  let comment = ''

  const res = {}
  envArr.forEach(([k, v]) => {
    const [a, comm] = k?.match(/^#\s+(.*)/) || []
    if (comm) {
      // TODO(vjpr): This is a comment for the next field.
      comment += comm + ' '
      return
    }
    // TODO(vjpr): Need to ignore whitespace here.
    const [b, key] = k?.match(/^#(.*)/) || []
    if (key) {
      res[key] = {value: key, comment}
      comment = '' // Reset
      return
    }
    // Empty line.
    if (k !== '') {
      res[k] = {value: k, comment}
      comment = '' // Reset
      return
    } else {
      comment = '' // Reset
    }
  })

  return res
}

////////////////////////////////////////////////////////////////////////////////

// Adapted from `get-shell-env.js`.

// We use array to maintain the order. Otherwise the comments don't match up properly.

// E.g. `FOO=1\nBAR=1` to `[[FOO, 1], [BAR: 1]]`.
// Be careful, the value could have an `=` char in it.
function parseEnvStrToArray(env) {
  // Only split on first instance of `=`.
  // From: https://stackoverflow.com/a/4607799/130910
  return env.split('\n').map(line => line.split(/=(.+)/))
}

////////////////////////////////////////////////////////////////////////////////

function readSimpleEnv(envStr) {
  return _.fromPairs(envStr.split('\n').map(line => [line, {value: line}]))
}
