# TODO

- Make a babel macro.
- Allow using it on the function line following a comment, and also when inline comment.
- Aggregate when log function is hit multiple times with same start value... Assume not parallel.
  - Good for quickly working out what part of a function took so much time.
- support ranges jsperf-start jsperf-end with tags

---

We have modified it to support using other than console.time.


# Status

## 20190123Wed

It doesn't work after `const a = await import('foo')`. I suspect an ordering issue. Tried to use Program and traverse down but then comments are not attached to nodes. :(

Might be better just to use a macro. But it is nice that I can just add a comment to quickly time something.

THE BIGGEST ISSUE with comments, is that we need to run our plugin first, but we need a traversal to have happened so that leading and trailing comment nodes are created.

We need to run first because otherwise the async transformations will run first (they must hook visitors higher up and traverse down themselves)

---
