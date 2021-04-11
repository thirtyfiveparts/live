---
id: wallaby
title: Wallaby
sidebar_label: Wallaby
slug: wallaby
---

# Getting Started

It's important to understand how Wallaby works under the hood to help with debugging issues and maintaining good performance.

See: https://wallabyjs.com/docs/intro/how-it-works.html

When you run Wallaby in the log you can see something like:

```
2020-11-26T22:20:24.174Z project File cache: /Users/Vaughan/Library/Application Support/JetBrains/IntelliJIdeaVaughan/system/wallaby/projects/66bcbd0a3fbc3b6e
```

This is where Wallaby copies all your code and runs it from. You can find the originals and instrumented files. You should look inside it.

All `node_modules` folders are used from your project local dir.

This creates a problem for a monrepo as when we import a workspace package `import @live/foo` then it will resolve this in a local project dir which will not have been compiled or instrumented.

You will get an error like:

```
SyntaxError: Unexpected token 'export'
```

We need to make sure they resolve to the cache directory. We can rewrite the required packages to their resolved file locations with babel or use some kind of require hook.

---

If something is not running properly, it will be a problem with not including the necessary files in the `files` property for Wallaby to copy.

# Important: Invalidating file cache after config change

If you change the configuration you must touch the `wallaby.ava.js` file in the root to trigger a cache invalidation.

This indicates cache is being cleared:

`Config file change detected, invalidating local cache`

---

We compile all files with babel and they will be written to disk which is different from how we run them using `babel/register`. Therefore, we have to make sure that our app can run fine when files are compiled to `.js` files and saved to disk. The best way is to tweak the wallaby config, reset the cache, and check the cache directory in the `instrumented` folder. The `original` dir is useful for seeing what is being copied across by Wallaby before compilation.
