// TODO(vjpr): Merge with `babel-preset-basic`. There are a couple of perf plugins that this has that the other doesn't.
module.exports = (api) => {
  return {
    presets: [
      require('@babel/preset-typescript'),
      [
        require('@babel/preset-env'),
        {
          debug: false,
        },
      ],
      // NOTE: There are still some Flow typings lying around JS files.
      //   Don't delete this until we have transitioned these to TS.
      require('@babel/preset-flow'),
    ],
    plugins: [
      // PERF(vjpr): This could slow things down because it does a lot of stat calls.
      require('@live/babel-plugin-manifest-mtime'),
      // --
      require('babel-plugin-macros'),
      require('babel-plugin-dynamic-import-node'),
      [
        require('@babel/plugin-transform-modules-commonjs'),
        {
          // TODO(vjpr): This could be used to speed up clis by controlling when things are imported.
          // Only require and import on first usage.
          lazy: true,
        },
      ],
      require('@babel/plugin-proposal-nullish-coalescing-operator'),
      require('@babel/plugin-proposal-optional-chaining'),
      require('@babel/plugin-proposal-class-properties'),
      [
        require('babel-plugin-module-resolver'),
        {
          // Needed so that cwd is set to the closest package.json.
          // See normalizeOptions.js in the plugin.
          // Can also be set to babelrc.
          cwd: 'packagejson',
          root: ['./src'],
          alias: {
            '^modules/(.+)': './src/modules/\\1',
            '^@src/(.+)': './src/\\1',
          },
        },
      ],
      [
        require('@live/babel-plugin-jsperf'),
        {
          // We use a global because TS removes unused imports.
          // https://stackoverflow.com/questions/24135072/how-do-you-prevent-typescript-from-automatically-discarding-unused-dependencie
          // Also, `@babel/plugin-transform-modules-commonjs, {lazy: true}` may interfere too with when the module is evaluated.
          timerObject: 'global.perf',
          timerStart: 'start',
          timerEnd: 'end',
        },
      ],
    ],
  }
}
