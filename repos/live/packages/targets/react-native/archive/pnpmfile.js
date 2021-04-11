//module.exports = {
//  hooks: {
//    readPackage,
//    readPackageJson
//  },
//}
//
//// Might standardize this for merging configs into the repo root one.
//function readPackageJson() {
//  return {}
//}
//
//function readPackage(pkg, {log}) {
//
//  if (pkg.name === 'expo-asset') {
//    pkg.dependencies['expo-constants'] = '*'
//  }
//
//  if (pkg.name === 'expo-gl') {
//    pkg.dependencies['prop-types'] = '*'
//  }
//
//  // TODO(vjpr): fbjs added as a root dep so not needed anymore.
//  //   It was needed by a bunch of things.
//
//  if (pkg.name === 'expo') {
//    pkg.dependencies['fbjs'] = '*'
//
//    // To avoid:
//    //   Error: Can't resolve 'react-native' in '/xxx/node_modules/.registry.npmjs.org/expo/31.0.6/e374941a243e455ed5c9d54b610a5c49/node_modules/expo/build'
//    // NOTE: Not needed anymore because we just add a `resolve.modules` config in our webpack resolver.
//    //pkg.dependencies['react-native'] = 'https://github.com/expo/react-native/archive/sdk-31.0.0.tar.gz'
//  }
//
//  if (pkg.name === 'react-native-gesture-handler') {
//    pkg.dependencies['fbjs'] = '*'
//  }
//
//  // --------------------
//
//  if (pkg.name === 'react-native') {
//    pkg.dependencies['schedule'] = '*'
//    pkg.dependencies['metro-config'] = '0.45.6'
//
//
//    // It seems silly to make this a dependency because of one little require.resolve statement.
//    // Maybe lets just install it globally.
//    /// https://github.com/expo/expo-cli/issues/255
//    //pkg.dependencies['expo'] = '*'
//  }
//
//  // ---------------------
//
//  if (pkg.dependencies && Object.keys(pkg.dependencies).includes('metro')) {
//    // NOTE: Git deps can't be used because its a monorepo.
//    //   'github:vjpr/metro#fe51dd0f6a2bb08ce07043edf2ffb935033f9ddc'
//    pkg.dependencies['metro'] = 'npm:metro-pnpm@0.45.6-vjpr.3'
//  }
//
//  // ---------------------
//
//  return pkg
//}
