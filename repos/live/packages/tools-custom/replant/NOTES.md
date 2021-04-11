# Notes

- Generate `.replant.yml`
  - Support `cson`, 'json', 'js'
- `replant`
  - `-c` - commit
  - `-d` - dry-run
    - create empty files to speed things up
  - `-o` - output new dir to here
  - `-x` - exclude dirs
  - allow adhoc e.g. creating a bunch of symlinks
- Use `.replantrc.js`
- Show preview of new tree
- Vinyl-fs
- Needs to parse all require statments (maybe we can reuse webpack's logic?)
  - Or maybe there is something for babel parser?
  - ignore node_modules
  - use knowledge of moduleDirectories or NODE_PATH
- Maybe use flow too?
- Ensure running tests after the changes take place (flow, mocha/wallaby)
- Closely related to jscodeshift. Maybe incorporate the two.
- Allow scripts to run
- Use version numbers in the files to track which was the latest committed tree. That way if the user is editing a file and it goes out of date. Or they try to modify a previous tree. It will let them know.
- Need to take a hash of the last tree to make sure the tree hasn't changed between commits. If the tree did change, need to merge the existing .replant-tree Hash the mod dates?

```
.replantrc
.replant.yml <- edit this one
.replant-current.yml <- this matches the file system (keeps track of the ids in case new files are added, or file names are swapped, etc.)
.replant-tree.yml
.replant-hash
.replant-history
```

Use cases

- Places files into folders

Don't get too carried away. Think about whether you would use it for large project re-org. You probably would not. You would want to go slowly.

Maybe for creating a bunch of files. Or applying a transform on a bunch of files. But you would probably prefer to use `jscodeshift` for that. Maybe it can be a complementary testing tool for `jscodeshift`.

- Do a big project reorganization.
- Have it generate a project in another directory that you can constantly work on while you continue working on the current code base.
- Write transforms in JS. Renaming imports, etc.
  - Refactoring scripts. Would be cool to be able to have a tree of all dependencies for a file and be able to detect the types of changes.
  - Start off with only FILE AND FOLDER NAMES first!!!
-

- Use dry-run to find a bunch of files and highlight them in a tree. Then you can choose a way to transform them, or a pipeline of transforms to ensure the code base doesn't break. Refactor scripts if you will.

---

# 20210318Thu

https://github.com/microsoft/vscode-languageserver-node
