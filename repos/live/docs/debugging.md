---
id: debugging
title: Debugging
sidebar_label: debugging
slug: /debugging
---

# Node.js debugging

Traditionally, debugging in Node.js was done via `console.log`.

To debug Node.js, you simply run Node with the `--inspect` flag like so: `node --inspect`. `--inspect-brk` is used to break immediately once the app starts.

There are two ways to debug:

- Chrome DevTools for Node
- IDE

## Chrome DevTools for Node

- Visit [chrome://inspect](chrome://inspect).
- Click `Open dedicated DevTools for Node`.
- It should automatically connect.

## IDE Debugging

IDE debugger integration is awesome because you can set breakpoints in your IDE. WebStorm has an exceptionally good integration. VSCode has one but its not as good.

### WebStorm

- To debug any script, you can click the green arrow next to any npm run script in `package.json`. This is very convenient to debug something - even tooling.

### VSCode

TODO

# Remote Node.js debugging

Dangertown! Very rarely, to solve a non-reproducible error remotely (staging or god-forbid production), you connect remotely and

- Restart the process using the `--inspect` flag.
- You can connect to `<server-ip-address>:9229`
- You must make sure that your IP is allowed by the AWS firewall (sec groups).

## WebStorm

TODO: Create a `JavaScript Debug` run configuration.

# Browser debugging

Using WebStorm you can set breakpoints in your IDE and debug your frontend.

Use the run configuration: `chrome debug :3000`.

IMPORTANT: You must allow WebStorm to start the browser (it can't be running beforehand) so that it can communicate to it via the debugger protocol. Vaughan typically debugs using Google Canary to avoid having to restart his main browser.

# Profiling

You can also view a CPU profile inside WebStorm

- Use the run configuration: `frontend - build (prod, profile)`

The profiling tooling is generally better in the dedicated "Chrome DevTools for Node". See above for instructions.
