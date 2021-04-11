import escapeStringRegexp from 'escape-string-regexp'

export default function(p, dir) {
  const safe = escapeStringRegexp(dir)
  // See http://regexr.com/3h4c1.
  return Boolean(p.match(`^${safe}\/|\/${safe}\/`))
}
