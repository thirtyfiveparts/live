// NOTE: We wrap all packages in `require(...)` or packages where our preset is used fail to resolve these packages.
module.exports = api => {
  return {

    ////////////////////////////////////////////////////////////////////////////

    presets: [
      require('@babel/preset-typescript'),
    ],

    ////////////////////////////////////////////////////////////////////////////

    plugins: [
      ////////////////////

      [require('@babel/plugin-proposal-optional-chaining'), {loose: false}],

      ////////////////////

      [
        require('@babel/plugin-proposal-nullish-coalescing-operator'),
        {loose: false},
      ],

      ////////////////////

      // Decorators must be before `class-properties`.
      [require('@babel/plugin-proposal-decorators'), {legacy: true}],

      ////////////////////

      // Patched to fix: https://github.com/WarnerHooh/babel-plugin-parameter-decorator/issues/25
      [require('@vjpr/babel-plugin-parameter-decorator')],

      ////////////////////

      // NOTE: Breaks automatic field getters with Sequelize if not in the correct spot.
      //   See: https://github.com/sequelize/sequelize/issues/11326
      //   See also: https://github.com/Polymer/lit-element/issues/234#issuecomment-687673767
      [require('@babel/plugin-proposal-class-properties'), {loose: true}],

      ////////////////////

      // This is aligned with `tsconfig.json#paths` setting.
      [
        require('babel-plugin-module-resolver'),
        {
          // Needed so that cwd is set to the closest package.json.
          // See normalizeOptions.js in the plugin.
          // Can also be set to babelrc.
          cwd: 'packagejson',
          root: ['./src'],
          // NOTE: Synced with: `babel-preset-live-node-basic` + `eslint-config-live` + `tsconfig-pkg`.
          alias: {
            '^modules/(.+)': './src/modules/\\1',
            '^@src/(.+)': './src/\\1',
          },
          // Maybe needed for eslint.
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          // --
        },
      ],

      ////////////////////

      // Allows annotations on parameters as used by `typegraphql` and `sequelize-typescript`.
      [require('babel-plugin-transform-typescript-metadata')],
      // Prevent having to include `regenerator-runtime` I think.
      //[
      //  '@babel/plugin-transform-runtime',
      //  {
      //    regenerator: true,
      //  },
      //],

      ////////////////////
    ],
  }
}
