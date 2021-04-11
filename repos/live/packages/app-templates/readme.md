For every template we keep the original and the modified one.

This allows us to sync the original with its scaffold cli, and then compare the changes we have made.

This is useful for us to known which changes we made when we need to support a new version. Purge, init, then diff is our approach.

---

react-native is available but I didn't include it because its too many files in the `Pods` directory.

---

```
rsync -r --exclude="node_modules" project-root/* dest/
```
