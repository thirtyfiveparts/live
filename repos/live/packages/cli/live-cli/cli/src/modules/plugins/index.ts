import readConfig from '@src/modules/config'

export default async function loadPresetsAndPlugins(config) {

  // Presets and plugins are a function because we want to allow the `live.config.js` to be read by the live-cli-helper to get babel/register configuration options so requires must be run lazily in order to be transpiled on-the-fly.
  const plugins = config.plugins?.()
  const presets = config.presets?.()

  loadPlugins(plugins)

  presets?.map((preset) => {
    loadPlugins(preset.plugins)
  })
}

function loadPlugins(plugins) {
  for (const plugin of plugins ?? []) {
    console.log({plugin})
  }
}
