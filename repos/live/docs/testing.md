---
id: testing
title: Testing
sidebar_label: Testing
slug: /testing
---

# Test Runners

We use several testing frameworks.

## Ava

Ava is a Node.js test runner. It can only run tests within a Node.js environment. It can also run tests against a JSDom environment.

## Jest

Jest is great for frontend tests. Its got some painful drawbacks in a monorepo environment though because of its use of its own module resolver called Metro (similar to Webpack).

## Wallaby

[Wallaby](https://wallabyjs.com/) is a great test runner for JavaScript and we use it a lot.

It allows tests to run instantly as your type - whether you are changing the tests or the code under test.

### Selective test running with Wallaby

When running in a large monorepo, Wallaby can sometimes slow down your machine and can take a long time to startup. The solution is to only run Wallaby for a select number of tests/files.

Unfortunately, in a WebStorm Run Configuration, you cannot pass parameters into Wallaby. To work around this we set a `Before Action` that writes to a file which the Wallaby config then reads from to determine which package to run tests in.

---

# Ava

```
ava -m <name of test>
```
