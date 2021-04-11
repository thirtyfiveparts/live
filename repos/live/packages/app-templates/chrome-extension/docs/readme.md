---
title: Live Template Chrome Extension
sidebar_label: Readme
slug: /
---

Simple template for building a Chrome Extension.

See [shared template docs](../docs-shared/readme.md).

## Install

...

## Why

...

## Development

Install dependencies

```
pnpm i
```

Start webpack dev server

```
npm run dev
```

- Visit chrome://extensions
- Check `Developer mode`
- Click `Load unpacked`
- Select `dist/dev`

## Debug

### Enable debug logging

Run this in your browser console. Ensure frame to log is set to all, or the extension.

```
localStorage.debug = '*'
```

## Publish

```
npm run build-prod
cd dist/prod
zip -r prod.zip prod
```

## Assets


