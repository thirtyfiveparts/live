module.exports = api => {
  return {
    presets: [
      require('@live/babel-preset-live-node-simple'),
      require('@babel/preset-react'),
    ],
  }
}
