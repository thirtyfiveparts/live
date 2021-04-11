#!/bin/sh

npm run conan-install

cmake-js --runtime=node compile

ln -sfn ../ide/appcode/.idea build/.idea

# Our run configurations seem to be deleted on `npm run install`.
# We should configure them externally.
#cp ide/appcode/.idea build/appcode/.run
