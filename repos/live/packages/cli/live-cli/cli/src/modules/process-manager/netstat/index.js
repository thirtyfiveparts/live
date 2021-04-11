import {spawn, exec} from 'promisify-child-process'
import os from 'os'

var normalizeValues = require('./util').normalizeValues;

export default async function() {
  const platform = os.platform()
  const {cmd, args} = commands[platform]
  const parser = parsers[platform]()
  const {stdout, stderr} = await spawn(cmd, args, {encoding: 'utf8'})
  const lines = stdout.split('\n')
  const out = lines.map(line => {
    return parser(line)
  })
  return out
}

const commands = {
  linux: {
    cmd: 'netstat',
    args: ['-apntu'],
  },
  darwin: {
    cmd: 'netstat',
    args: ['-v', '-n', '-p', 'tcp'],
  },
  win32: {
    cmd: 'netstat.exe',
    args: ['-a', '-n', '-o'],
  },
}

////////////////////////////////////////////////////////////////////////////////

const parsers = {
  linux: function(options) {
    options = options || {}
    var parseName = !!options.parseName

    return function(line) {
      var parts = line.split(/\s/).filter(String)
      if (!parts.length || parts[0].match(/^(tcp|udp)/) === null) {
        return
      }

      // NOTE: insert null for missing state column on UDP
      if (parts[0].indexOf('udp') === 0) {
        parts.splice(5, 0, null)
      }

      var name = ''
      var pid = parts.slice(6, parts.length).join(' ')
      if (parseName && pid.indexOf('/') > 0) {
        var pidParts = pid.split('/')
        pid = pidParts[0]
        name = pidParts.slice(1, pidParts.length).join('/')
      }

      var item = {
        protocol: parts[0],
        local: parts[3],
        remote: parts[4],
        state: parts[5],
        pid: pid,
      }

      if (parseName) {
        item.processName = name
      }

      return normalizeValues(item)
    }
  },

  darwin: function(options) {
    options = options || {}

    return function(line) {
      var parts = line.split(/\s/).filter(String)

      //if (!parts.length || parts.length != 10) {
      if (!parts.length || parts.length < 10) { // We want to skip headers.
        return
      }

      var item = {
        protocol: parts[0] == 'tcp4' ? 'tcp' : parts[0],
        local: parts[3],
        remote: parts[4],
        state: parts[5],
        pid: parts[8],
      }


      return normalizeValues(item)
    }
  },
}
