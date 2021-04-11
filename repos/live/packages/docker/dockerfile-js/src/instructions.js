import _ from 'lodash'
import dargs from 'dargs'

const indent = '  '

export default {
  //
  // Test case:
  //   ARG DEPENDENCIES_VERSION=latest
  //   FROM foo/bar.baz:${DEPENDENCIES_VERSION} AS build
  //
  from(opts) {
    if (_.isString(opts)) {
      return 'FROM ' + opts
    }
    let {image, tagArg, tag, digest, registry, as} = opts
    let out = ''
    if (registry) image = registry + '/' + image
    out += `FROM ${image}`
    if (tagArg) {
      out += ':${' + tagArg + '}' // Its clearer without interpolation.
    } else if (tag) {
      out += `:${tag}`
    } else if (digest) {
      out += `@${digest}`
    }
    if (as) {
      out += ` AS ${as}`
    }
    return out
  },
  run(opts) {
    return run('RUN', opts)
  },
  maintainer(opts) {
    const {name} = opts
    // https://docs.docker.com/engine/reference/builder/#maintainer-deprecated
    console.warn('MAINTAINER is deprecated. Replacing with LABEL.')
    // TODO(vjpr): This could break some things.
    return `LABEL maintainer=${name}`
    //return `MAINTAINER ${name}`
  },
  cmd(opts) {
    let out = 'CMD '
    if (_.isString(opts)) {
      out += opts
      return out
    }
    const {cmd} = opts
    if (_.isArray(cmd)) {
      out += toDockerJsonArrayForm(cmd)
    } else {
      // TODO(vjpr): Escape backslashes.
      out += cmd
    }
    return out
  },
  arg(opts, val) {
    return keyValueFormMultipleInstructions('ARG', opts, val)
  },
  label(opts) {
    return keyValueForm('LABEL', opts)
  },
  expose(ports) {
    let out = []
    ports.map(p => {
      if (_.isString(p) || _.isNumber(p)) {
        out.push(`EXPOSE ${p}`)
      } else if (_.isPlainObject(p)) {
        out.push(`EXPOSE ${p.number}/${p.protocol}`)
      }
    })
    return out.join('\n')
  },
  env(opts) {
    return keyValueForm('ENV', opts)
  },
  directive() {},
  heading(name, desc) {
    let out = ''
    out += '\n'
    out += `# ${name}\n`
    out += '# ------------------------' // 20
    if (desc) out += '\n# ' + desc
    return out
  },
  comment(str) {
    return '# ' + str
  },
  copy(a, b) {
    let out = 'COPY '
    // TODO(vjpr): Could use _.cond.
    if (_.isPlainObject(a)) {
      const {src, dest, chown} = a
      if (chown) out += `--chown=${chown} `
      out += `${src} ${dest}`
    }
    return out
  },
  entryPoint(opts) {
    return run('ENTRYPOINT', opts)
  },
  volume(opts) {
    opts = _.castArray(opts)
    return 'VOLUME ' + toDockerJsonArrayForm(opts)
  },
  user(opts) {
    const {user, group} = opts
    let out = 'USER '
    out += user
    if (group) out += ':' + group
    return out
  },
  shell(opts) {
    opts = _.castArray(opts)
    return 'VOLUME ' + toDockerJsonArrayForm(opts)
  },
  healthCheck(opts) {
    let out = 'HEALTHCHECK '
    if (!opts) out += 'NONE'

    const healthCheckOpts = ['interval', 'timeout', 'startPeriod', 'retries']
    const flags = dargs(_.pick(opts, healthCheckOpts)).join(' ')
    out += flags
    out += ' '
    out += '\\' + '\n' + indent + 'CMD '
    out += opts.cmd

    return out
  },
  stopSignal(opts) {
    return 'STOPSIGNAL ' + opts
  },
}

function toDockerJsonArrayForm(items) {
  return `[${items.map(c => `"${c}"`).join(', ')}]`
}

//
// LABEL foo=bar
//   baz=biz
//
function keyValueForm(instructionName, opts) {
  let out = `${instructionName} `
  const indent = '  '
  //const indent = out.length // TODO(vjpr): This indent will align all labels.
  const items = Object.entries(opts).map(([k, v]) => {
    return `${k}=${v}`
  })
  out += items.join(' \\' + '\n' + indent)
  return out
}

// ARG foo=bar
// ARG bar=baz

function keyValueFormMultipleInstructions(name, p, val) {
  let out = []
  let model = {}
  if (val) {
    out.push(`${name} ${p}=${val}`)
    model[p] = val
  } else if (_.isString(p) || _.isNumber(p)) {
    out.push(`${name} ${p}`)
    model[p] = null
  } else if (_.isPlainObject(p)) {
    Object.entries(p).map(([k, v]) => {
      out.push(`${name} ${k}=${v}`)
      model[k] = v
    })
    // TODO(vjpr): Throw error if more than one is provided.
  }
  return [out.join('\n'), model]
}

// ENTRYPOINT and RUN
// shell => RUN <command> (shell form, the command is run in a shell, which by default is /bin/sh -c on Linux or cmd /S /C on Windows)
// exec  => RUN ["executable", "param1", "param2"] (exec form)
function run(ins, opts) {
  let out = ins + ' '
  if (_.isString(opts)) {
    out += opts
    return out
  }
  const cmd = opts.cmd || _.castArray(opts)
  if (_.isArray(cmd)) {
    out += toDockerJsonArrayForm(cmd)
  } else {
    // TODO(vjpr): Escape backslashes.
    out += cmd
  }
  return out
}
