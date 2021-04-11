---
hide_title: true
---

# jetbrains-project

> Utilities for working with JavaScript projects (and monorepos) in JetBrains IDEs (IntelliJ, WebStorm, etc.).

## Highlights

- Efficient file watcher to exclude certain dirs from indexing as they are created to prevent IDE locking up.

## Try

```
npx jetbrains-project
```

## Install

```
npm i -g jetbrains-project
```

## Usage

```
cd your-intellij-project-dir
jetbrains-project update
```

Watch an IntelliJ project folder for when new folders are created, and automatically exclude their `node_modules` and other generated dirs you specify such as `lib`, `build`, etc.

## Features

### Excluding `node_modules`

Once the IntelliJ indexer starts it cannot be stopped and will max out your cpus until its finished. See [here](http://stackoverflow.com/questions/29965896/how-can-i-stop-indexing-intellij-idea) for some discussion.

IntelliJ only indexes direct dependencies as of `v2016.2.2` (see [issue](https://youtrack.jetbrains.com/issue/WEB-11419)), that is, those defined in your `package.json`.

If we use a mono-project (i.e. one IntelliJ project/module with multiple packages inside), we may end up with a huge number of dependency files to index.

`node_modules` dirs can easily grow to 100K+ files even when installing one module, which will take ages to index.

Installing a single module will cause indexing, which will slow down the IDE.

The following IntelliJ issue would resolve this: [Ability to exclude files from indexing in a path by their names (full paths) or by pattern](https://youtrack.jetbrains.com/issue/IDEA-127753).

The following issues are also related:

- [Ability to have default Excluded Folders (not per-project)](https://youtrack.jetbrains.com/issue/IDEA-150784)

If the IntelliJ cache becomes corrupt (e.g. after an improper shutdown), you will have to wait ages for it to re-index.

## License

MIT © Vaughan Rouesnel
