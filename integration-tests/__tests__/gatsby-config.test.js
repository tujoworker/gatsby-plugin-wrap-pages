import config from 'gatsby-plugin-wrap-pages/gatsby-config'

describe('gatsby-config.js', () => {
  it('should inject "__plugin_uuid" with a string', () => {
    const pluginConfigA = {}
    config(pluginConfigA)
    expect(pluginConfigA.__plugin_uuid).toBe('1')

    const pluginConfigB = {}
    config(pluginConfigB)
    expect(pluginConfigB.__plugin_uuid).toBe('2')
  })
})
