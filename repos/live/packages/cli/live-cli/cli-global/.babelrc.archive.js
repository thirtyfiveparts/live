module.exports = {
  "presets": [
    "@babel/preset-env"
  ],
  "plugins": [
    "@babel/plugin-proposal-optional-chaining",
    [
      "babel-plugin-module-resolver",
      {
        "root": [
          "./src"
        ],
        "alias": {
          "^modules/(.+)": "./src/modules/\\1",
          "^@src/(.+)": "./src/\\1"
        }
      }
    ]
  ]
}
