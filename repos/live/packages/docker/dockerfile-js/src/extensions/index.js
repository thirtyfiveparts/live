import dargs from 'dargs'

export default {

  apkAdd: (opts: Opts) => {
    // noCache - https://stackoverflow.com/a/49119046/130910
    let {noCache, virtual, pkgs} = opts
    noCache = noCache ?? true
    // Filter duplicates.
    pkgs = [...new Set(pkgs)]
    const indent = '  '
    let out = 'RUN '
    const flags =
      ' ' + dargs({noCache, virtual}, {useEquals: false}).join(' ') + ' '
    out += 'apk add' + flags + '\\' + '\n' + indent
    out += pkgs.join(' \\' + '\n' + indent)
    return out
  },

}
