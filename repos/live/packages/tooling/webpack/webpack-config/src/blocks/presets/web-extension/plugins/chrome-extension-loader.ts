import ChromeExtensionReloader from '@vjpr/webpack-extension-reloader'

export function chromeExtensionLoader(opts) {
  const {chromeExtensionReloader} = opts.config
  return {
    plugins: [
      new ChromeExtensionReloader({
        // TODO(vjpr): Get next available. Make it configurable though.
        port: chromeExtensionReloader?.port ?? 9090, // Which port use to create the server
        reloadPage: true, // Force the reload of the page also
        entries: {
          // This property determines which files the reloader script is injected into.
          //   The reloader script won't work inside an injected content script because it needs to use Chrome Extension apis.
          //contentScript: ['content-script-injected', 'content-script'], // Use the entry names, not the file name or the path
          // --
          contentScript: ['content-script'], // Use the entry names, not the file name or the path
          background: 'background',
          other: ['content-script-injected'],
        },
        // NOTE: Disabled because of: https://github.com/rubenspgcavalcante/webpack-extension-reloader/issues/111
        //manifest: join(rootDir, 'src/manifest.json'),
      }),
    ],
  }
}
