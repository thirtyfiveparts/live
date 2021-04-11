// NOTE: We wrap all packages in `require(...)` or packages where our preset is used fail to resolve these packages.
module.exports = api => {
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: 'current',
          },
        },
      ],
      [require('@live/babel-preset-basic')],
    ],
  }
}
