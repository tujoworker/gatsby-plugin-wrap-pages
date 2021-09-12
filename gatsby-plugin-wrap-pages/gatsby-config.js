module.exports = function config(params) {
  if (!params.__plugin_uuid) {
    if (!globalThis.WPPluginId) {
      globalThis.WPPluginId = 1
    }
    params.__plugin_uuid = String(globalThis.WPPluginId)
    globalThis.WPPluginId++
  }
}
