// Webpack
//   https://stackoverflow.com/questions/47540440/can-i-get-the-dependency-tree-before-webpack-starts-to-build

// Typescript Language Service

// jest-haste-map
// https://github.com/facebook/jest/blob/master/packages/jest-haste-map/src/index.ts
// Uses watchman behind-the-scenes.
// But no symlink support.

// dependency-cruiser

export default async function getDependencyGraph() {

  const dependents = []
  const dependencies = []

  return {dependents, dependencies}
}
