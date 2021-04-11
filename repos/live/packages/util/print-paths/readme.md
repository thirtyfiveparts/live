# print-paths

# Why?

Different tools and config files need to know where to find your code.

Each has its own file. Ideally it would all be in one `.js` file which could be included from other tools.

But many tools have their own json/yaml config file stored in a specific location which does not allow imports.

This package prints the locations of all the files/configs which do paths.

Then the user can go an manually sync them.

## Why not automatic sync?

If a user wants to change an individual file, they have to remember that there is a tool that will write to the config. This is annoying.
