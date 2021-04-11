# .dev

Useful for symlinking config files that exist elsewhere on your computer that you need to conveniently access during development.

Use a sub-folder for each tool (e.g. postgres, redis).

These locations are usually specific to each developers's machine.

## Update

NOTE: You will be prompted to overwrite existing links.
Be careful not to mess up argument order or you will overwrite your config files.

```
npm run dot-dev
```

In the future we will probably move `update.js` because different platforms may need more complicated logic to locate configs.

---

TODO: Convert to JS code. 
