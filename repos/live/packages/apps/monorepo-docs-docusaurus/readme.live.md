# Docusaurus

# Getting started

```
pnpm run --filter @live/app-template-docosaurus start
```

# Dependencies

`@babel/plugin-syntax-dynamic-import` needs to be manually added.
See https://github.com/babel/babel/issues/10212#issuecomment-512280015

    "remark-admonitions": "^1.2.1"
    "infima": "^0.2.0-alpha.11",
    "@docusaurus/mdx-loader": "^2.0.0-alpha.55",
    "@babel/plugin-syntax-dynamic-import": "*",
    "@babel/preset-env": "^7.9.6",
