const ignored = [
  'lib',
  'build',
  'tmp',
  '.cache',
  'flow-typed',
  '.dev',
  '.git-subrepo',
  'dist',
  '.next',
]

module.exports = ({defaultExcludeDirs, defaultIgnoreGlobs}) => ({
  excludeDirs: [...defaultExcludeDirs.filter(el => !ignored.includes(el))],
  // Exclude dirs from IntelliJ project. All but the symlinks.
  excludeGlobs: [
    'packages/public-local',
    // BUG: Relative import resolution inside a symlinked dir resolves to realpath.
    // See: https://youtrack.jetbrains.com/issue/WEB-35773
    //'packages/public',
  ],
  ignoreGlobs: [
    ...defaultIgnoreGlobs,
    // IntelliJ now supports exclude patterns.
    'node_modules',
    ...ignored,
  ],
})
