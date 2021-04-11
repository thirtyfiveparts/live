# Peer deps

For `pnpm-react-native-helper`.

    "metro": "^0.64.0",
    "metro-core": "^0.64.0",
    "metro-cache": "^0.64.0",
    "metro-config": "^0.64.0"

# Missing deps

## @react-native-community/cli-platform-ios

Expected flat node_modules.

_ios/Podfile_

```
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'
```

## `react-native-codegen`

Expected flat node_modules.

See: https://github.com/facebook/react-native/blob/master/scripts/generate-specs.sh?rgh-link-date=2021-04-08T08%3A54%3A06Z

_react-native/scripts/generate_specs.sh_

```
  CODEGEN_PATH=$("$NODE_BINARY" -e "console.log(require('path').dirname(require.resolve('react-native-codegen/package.json')))")
```

# Excluded templates

`ios/Podfile.lock` - it uses project-relative paths which will be different based on location.
