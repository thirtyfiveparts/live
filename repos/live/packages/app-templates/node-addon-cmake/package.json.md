# "conan-install": "cd build-conan && conan install .."

We use `build-conan` because when running `cmake-js` if a build fails it will delete the `build` dir.

# install / install-electron

We have these two because we might want to have two different targets `node` and `electron`.

Can also set these properties in `.npmrc`...

# `appcode-open`


