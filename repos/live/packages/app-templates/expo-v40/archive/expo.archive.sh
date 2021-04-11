#!/bin/bash

# Use Expo's new dev server which talks to Metro directly instead of via the react-native-cli.
# NOTE: No longer needed as of Expo SDK 40.

#EXPO_USE_DEV_SERVER=true expo "$@"

# NOTE: Without EXPO_USE_DEV_SERVER, for WebStorm debugging to work we need to pass through METRO_NODE_OPTIONS.
#   See: https://github.com/expo/expo-cli/issues/3009

# ---

expo "$@"
