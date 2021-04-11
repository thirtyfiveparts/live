---
id: monorepo
title: ThirtyFive Monorepo
sidebar_label: Monorepo
slug: /monorepo
---

Welcome to the ThirtyFive Monorepo documentation!

To understand the codebase you should start from here. Please help us improve this documentation.

Documentation per package is available here: [Packages](/packages)

## What's a monorepo?

We keep all our JavaScript packages and projects in a single repository instead of using separate repositories.

We use a slightly less common variation which we are terming a "multi-monorepo" to solve some problems regarding access rights and code stability which is explained further down.

## Why use a Monorepo?

- Branch entire codebase at once.
- Single tooling setup for all projects.
- TODO

## The "multi-monorepo" approach

You will notice a directory called `repos` that contains all our code.

### `repos` folder

TODO

```
- repos
  - thirtyfive-oss - open-source libraries
  - thirtyfive-experiments - unstable code/experiements
```

We use "repos" to make a high-level segregation of code based on access rights and code quality/stability.

### Why?

A downside of a traditional monorepo is that it's not possible to give limited access to a part of a tree. With many-repos you can control access rights per repo.

Another downside is that code of high quality can get mixed with more experimental code. In a many-repo setup, you would normally create a separate repo for experiments or less stable code. But sometimes you may want to enforce strict eslint on one part of the codebase, but not on a newer more experimental part.

For full-time employees it's fine to allow access to all code but there are some occasions when you might want to control access or segregate by stability.

#### a. Open source

Say we want to share an open-source library that we created or forked. If we need to fix a bug or add a feature that involves a modification to the open-source library, we just create a feature branch in our monorepo, and we can make modifications to any package in our code and also in the open-source code.

Normally you would need to have two repos, and use some kind of multi-repo management tool to sync branching, tagging, etc. It's a real pain.

#### b. Client projects

If we are working on a client project, we may want to share some code or use common tooling between our projects.

Normally you would have to publish the code to npm or github that you would want to share, or copy-paste code.

With a multi-monorepo setup, we can easily recreate monorepo with a limited subset of the `repos` directory, and sync directly to it.

#### c. Stability / Quality

We achieve this by using a high-level `repo` to group less stable code. You will notice `gd-scratch` as an example of this.

### Multi-monorepo alternatives

- `npm link` - Painful to setup and sync branches.
- Multi repo management cli tools
  - https://github.com/mateodelnorte/meta
  - https://github.com/nosarthur/gita
  - https://github.com/mixu/gr
- [Git submodules](https://www.atlassian.com/git/tutorials/git-submodule)
- [Git subtree](https://www.atlassian.com/git/tutorials/git-subtree) <- we use this!

### How?

*How do we implement our "multi-monorepo"?*

**Generic monorepo root files.** The monorepo root files are generic so it becomes easy to copy the root files and add only a subset of the `repos` dir.

**git subrepo.** We use the [`git subrepo`](https://github.com/ingydotnet/git-subrepo) cli tool which uses the [`git subtree`](https://www.atlassian.com/git/tutorials/git-subtree) feature to do a two-way sync of select repos to other Github repos publically or in different organizations.

## Repo structure

Our monorepo root contains all the tooling for our repo.

We keep it as re-usable as possible. This helps with the "multi-monorepo" by allowing

- .circleci
- [.dev](./dot-dev)
- [.docker-trees](readme.md#docker-trees)
- [.github](https://stackoverflow.com/a/61301254/130910) - Github convention folder
- .idea - WebStorm IDE configuration
- .run - WebStorm Run Configurations
- deploy - Some old deploy stuff.
- [docs](readme.md#docs)
- [repos](readme.md#repos-folder)
- tmp
- [tools](readme.md#tools)
- ...root files

### `.docker-trees`

Each of our apps/services depends on workspace packages outside of their package root. Docker can only add files to an image that are within its "build context" which is a single directory.

We would need to set our "build context" to the monorepo root, but this would mean that building an image would take a long time because of the initial context copying phase needing to copy the entire monorepo which could be quite large.

Therefore, we examine the `package.json` files of all deps of a service (and their deps / aka. transitive deps) and create a partial filtered directory tree for each service.

```
- .docker-trees

  - app-foo
    - Dockerfile
    - repos
      - org
        - apps
          - app-foo
        - libs
          - lib-common
          - lib-foo
          
  - app-bar
    - Dockerfile
    - repos
        - org
          - apps
            - app-bar
          - libs
            - lib-common
            - lib-bar
```

### `tools`

Notice that most of the root configuration files such a `.eslintrc.js` simply reference another file inside `tools/<tool name>`.

This means the monorepo root is generic and can be easily copied without copying the repo's specific customizations.

It's much cleaner - all your customization and configuration is centralized inside of `tools`.

If you look inside `tools/<tool name>` you will see another level of indirection. Most tools will link to a package that contains a "default" configuration or a configuration file that is customized for your org.

For example, look at `tools/eslint/.eslintrc.js`.

```
module.exports = require('@live/eslint-config')
```

All this file does is link to a default eslint configuration. If you wanted to override this file you would just create your own package called `@org/eslint-config`. This allows you to publish your config, and share it across your organization. Even if you keep your code in a singe monorepo, there may be other tools outside of the repo that need to use it, or you might want to open-source it.

# `docs`

This directory is reference by the `docs` Docusaurus project which compiles all `docs` directories across the codebase into a single website.

- View all documentation in one place!
- Keep documentation close to the code it describes.
- `readme.md` files become nicely formatted and easy to read.

To add a directory just add `live.docusaurus.enable = true` to a package's `package.json`, add a `docs` directory, and a `sidebar.js` file.
