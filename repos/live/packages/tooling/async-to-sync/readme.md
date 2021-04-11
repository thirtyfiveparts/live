# @live/async-to-sync

TODO

Use `child_process` to run run a JS file with async code in a sync environment.

Our main use for this is for configuration that must be sync.

- wallaby.js
- docusuarus.config.js

We need async because we want to use `workspace-pkgs` functions.

Maybe it would be easier to just rewrite this as sync tho. Its a bit of a headache.
