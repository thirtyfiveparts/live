////////////////////////////////////////////////////////////////////////////////

// You may see lots of messages like:
//
//   (node:86433) [DEP_WEBPACK_MAIN_TEMPLATE_RENDER_MANIFEST] DeprecationWarning: MainTemplate.hooks.renderManifest is deprecated (use Compilation.hooks.renderManifest instead)
//
// These are currently caused by `mini-css-extract-plugin`.
// See: https://github.com/webpack-contrib/mini-css-extract-plugin/issues/536#issuecomment-641462317
export function handleDeprecationWarnings() {
  // This will hide the warnings.
  // TODO(vjpr): Print a warning.
  //process.traceDeprecation = false
}
