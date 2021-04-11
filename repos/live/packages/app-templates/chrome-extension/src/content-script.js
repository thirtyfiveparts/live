
// This allows us to access the `window`, because content scripts run in an isolated environment.
// See https://stackoverflow.com/a/20513730/130910
import injectScript from '@live/inject-script'
injectScript(chrome.extension.getURL('content-script-injected.js'), 'body')

// Content scripts have access to the dom, just not global variables and functions.
// Injected scripts will lose access to chrome extension apis.

// TODO(vjpr): Use `chrome.runtime.sendMessage` to access only what you need.
// See: https://stackoverflow.com/a/18289185/130910
