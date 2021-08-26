import systemPath from 'path'
import { writeFile } from 'fs'
import { handleWrapperScopesAndPages } from 'gatsby-plugin-wrap-pages/plugin-logic'

beforeEach(() => {
  jest.resetAllMocks()

  globalThis.writeTimeoutDelay = 0
  globalThis.directoryRoot = systemPath.resolve('./__mocks__')
  globalThis.globalScopeFiles = {}
  globalThis.scopeFilesHash = undefined
})

const deletePage = jest.fn()
const getParams = (merge = null) => ({
  pages: [],
  actions: { deletePage },
  wrapperName: null,
  filterFile: null,
  filterDir: null,
  ...merge,
})
const getPage = (component = 'src/pages/index.js', merge = null) => [
  'path',
  {
    path: '/path',
    component: systemPath.resolve(
      globalThis.directoryRoot.replace(/\\/g, '/'),
      component
    ),
    context: {},
    ...merge,
  },
]

jest.mock('fs', () => {
  return {
    ...jest.requireActual('fs'),
    writeFile: jest.fn(),
  }
})

jest.mock('path', () => ({
  ...jest.requireActual('path'),
  sep: '/',
}))

describe('wrapper', () => {
  it('should get deleted as a page', async () => {
    const pages = [
      getPage('src/pages/index.js'),
      getPage('src/pages/wrap-pages.js'),
    ]
    await handleWrapperScopesAndPages(getParams({ pages }))

    expect(deletePage).toBeCalledTimes(1)
  })

  it('should have scopeData with valid data', async () => {
    const pages = [
      getPage('src/pages/index.js'),
      getPage('src/pages/wrap-pages.js'),
    ]
    await handleWrapperScopesAndPages(getParams({ pages }))

    const page = pages[1] // get the wrapper
    const wrapper = page[1] // select wrapper content
    expect(wrapper).toHaveProperty('scopeData')
    expect(wrapper.scopeData.relativeComponentPath).toBe(
      'src/pages/wrap-pages.js'
    )
    expect(wrapper.scopeData.relativeComponentHash).toBe(
      'de24c938e6d0ae34eea46b0360bc707c'
    )
  })

  it('should have scopeData with valid data for "first scope"', async () => {
    const pages = [
      getPage('src/pages/first-scope/index.js'),
      getPage('src/pages/first-scope/wrap-pages.js'),
    ]
    await handleWrapperScopesAndPages(getParams({ pages }))

    const page = pages[1] // get the wrapper
    const wrapper = page[1] // select wrapper content
    expect(wrapper).toHaveProperty('scopeData')
    expect(wrapper.scopeData.relativeComponentPath).toBe(
      'src/pages/first-scope/wrap-pages.js'
    )
    expect(wrapper.scopeData.relativeComponentHash).toBe(
      'a8e85ae8b0a005f5a28a5cb14cf5a31b'
    )
    expect(writeFile).toHaveBeenCalledTimes(1)
    expect(writeFile).toHaveBeenCalledWith(
      systemPath.join(globalThis.directoryRoot, '/.cache/wpe-scopes.js'),
      `export * as _a8e85ae8b0a005f5a28a5cb14cf5a31b from '../src/pages/first-scope/wrap-pages.js';`,
      null,
      expect.any(Function)
    )
  })

  it('should have scopeData with valid data for "second scope"', async () => {
    const pages = [
      getPage('src/pages/first-scope/second-scope/index.js'),
      getPage('src/pages/first-scope/second-scope/wrap-pages.js'),
    ]
    await handleWrapperScopesAndPages(getParams({ pages }))

    const page = pages[1] // get the wrapper
    const wrapper = page[1] // select wrapper content
    expect(wrapper).toHaveProperty('scopeData')
    expect(wrapper.scopeData.relativeComponentPath).toBe(
      'src/pages/first-scope/second-scope/wrap-pages.js'
    )
    expect(wrapper.scopeData.relativeComponentHash).toBe(
      '04a5fd4a912092212894c198071f22d5'
    )
    expect(writeFile).toHaveBeenCalledTimes(1)
    expect(writeFile).toHaveBeenCalledWith(
      systemPath.join(globalThis.directoryRoot, '/.cache/wpe-scopes.js'),
      `export * as _04a5fd4a912092212894c198071f22d5 from '../src/pages/first-scope/second-scope/wrap-pages.js';`,
      null,
      expect.any(Function)
    )
  })
})

describe('page', () => {
  it('should mutate page object but keep object instance', async () => {
    const firstPage = getPage('src/pages/index.js')
    const secondPage = getPage('src/pages/wrap-pages.js')
    const pages = [firstPage, secondPage]
    await handleWrapperScopesAndPages(getParams({ pages }))

    expect(pages[0]).toBe(firstPage)
    expect(pages[1]).toBe(secondPage)
  })

  it('should have context with valid data', async () => {
    const pages = [
      getPage('src/pages/index.js'),
      getPage('src/pages/wrap-pages.js'),
    ]
    await handleWrapperScopesAndPages(getParams({ pages }))

    const page = pages[0] // get the first page
    const pageData = page[1] // select page content
    expect(pageData).toHaveProperty('context')
    expect(pageData.context).toMatchObject({
      WPS: [{ hash: 'de24c938e6d0ae34eea46b0360bc707c', isSame: true }],
    })
  })

  it('should support backslash separator', async () => {
    systemPath.sep = '\\'
    globalThis.directoryRoot = systemPath
      .resolve('./__mocks__')
      .replace(/\//g, systemPath.sep)

    const pages = [
      getPage('src/pages/index.js'),
      getPage('src/pages/wrap-pages.js'),
    ]
    await handleWrapperScopesAndPages(getParams({ pages }))

    const page = pages[0] // get the first page
    const pageData = page[1] // select page content
    expect(pageData).toHaveProperty('context')
    expect(pageData.context).toMatchObject({
      WPS: [{ hash: 'de24c938e6d0ae34eea46b0360bc707c', isSame: true }],
    })
    expect(writeFile).toHaveBeenCalledTimes(1)
    expect(writeFile).toHaveBeenCalledWith(
      systemPath.join(
        globalThis.directoryRoot.replace(/\\/g, '/'),
        '/.cache/wpe-scopes.js'
      ),
      `export * as _de24c938e6d0ae34eea46b0360bc707c from '../src/pages/wrap-pages.js';`,
      null,
      expect.any(Function)
    )

    systemPath.sep = '/'
  })

  it('should support backslash directory', async () => {
    systemPath.sep = '\\'
    globalThis.directoryRoot = systemPath
      .resolve('./__mocks__')
      .replace(/\//g, systemPath.sep)

    const replaceWithBackslash = (arr) => {
      return arr.map((params) => {
        if (params.component) {
          params.component = params.component.replace(/\//g, systemPath.sep)
        }
        return params
      })
    }

    const pages = [
      replaceWithBackslash(getPage('src/pages/index.js')),
      replaceWithBackslash(getPage('src/pages/wrap-pages.js')),
    ]
    await handleWrapperScopesAndPages(getParams({ pages }))

    const page = pages[0] // get the first page
    const pageData = page[1] // select page content
    expect(pageData).toHaveProperty('context')
    expect(pageData.context).toMatchObject({
      WPS: [{ hash: 'de24c938e6d0ae34eea46b0360bc707c', isSame: true }],
    })
    expect(writeFile).toHaveBeenCalledTimes(1)
    expect(writeFile).toHaveBeenCalledWith(
      systemPath.join(
        globalThis.directoryRoot.replace(/\\/g, '/'),
        '/.cache/wpe-scopes.js'
      ),
      `export * as _de24c938e6d0ae34eea46b0360bc707c from '../src/pages/wrap-pages.js';`,
      null,
      expect.any(Function)
    )

    systemPath.sep = '/'
  })

  it('should contain isSame on same scope', async () => {
    const pages = [
      getPage('src/pages/index.js'),
      getPage('src/pages/wrap-pages.js'),
    ]
    await handleWrapperScopesAndPages(getParams({ pages }))

    const page = pages[0] // get the first page
    const pageData = page[1] // select page content
    expect(Array.isArray(pageData.context.WPS)).toBe(true)
    expect(pageData.context.WPS[0].isSame).toBe(true)
    expect(writeFile).toHaveBeenCalledTimes(1)
    expect(writeFile).toHaveBeenCalledWith(
      systemPath.join(globalThis.directoryRoot, '/.cache/wpe-scopes.js'),
      `export * as _de24c938e6d0ae34eea46b0360bc707c from '../src/pages/wrap-pages.js';`,
      null,
      expect.any(Function)
    )
  })

  it('should contain wrapper details with "first scope" as the same', async () => {
    const pages = [
      getPage('src/pages/first-scope/index.js'),
      getPage('src/pages/first-scope/wrap-pages.js'),
      getPage('src/pages/index.js'),
      getPage('src/pages/wrap-pages.js'),
    ]
    await handleWrapperScopesAndPages(getParams({ pages }))

    const page = pages[0] // get the first page
    const pageData = page[1] // select page content
    expect(pageData.context).toMatchObject({
      WPS: [
        { hash: 'a8e85ae8b0a005f5a28a5cb14cf5a31b', isSame: true },
        { hash: 'de24c938e6d0ae34eea46b0360bc707c' },
      ],
    })
    expect(writeFile).toHaveBeenCalledTimes(1)
    expect(writeFile).toHaveBeenCalledWith(
      systemPath.join(globalThis.directoryRoot, '/.cache/wpe-scopes.js'),
      `export * as _a8e85ae8b0a005f5a28a5cb14cf5a31b from '../src/pages/first-scope/wrap-pages.js';
export * as _de24c938e6d0ae34eea46b0360bc707c from '../src/pages/wrap-pages.js';`,
      null,
      expect.any(Function)
    )
  })

  it('should contain wrapper details with "second scope" as the same', async () => {
    const pages = [
      getPage('src/pages/first-scope/second-scope/index.js'),
      getPage('src/pages/first-scope/second-scope/wrap-pages.js'),
      getPage('src/pages/first-scope/index.js'),
      getPage('src/pages/first-scope/wrap-pages.js'),
      getPage('src/pages/index.js'),
      getPage('src/pages/wrap-pages.js'),
    ]
    await handleWrapperScopesAndPages(getParams({ pages }))

    const page = pages[0] // get the first page
    const pageData = page[1] // select page content
    expect(pageData.context).toMatchObject({
      WPS: [
        { hash: '04a5fd4a912092212894c198071f22d5', isSame: true },
        { hash: 'a8e85ae8b0a005f5a28a5cb14cf5a31b' },
        { hash: 'de24c938e6d0ae34eea46b0360bc707c' },
      ],
    })
    expect(writeFile).toHaveBeenCalledTimes(1)
    expect(writeFile).toHaveBeenCalledWith(
      systemPath.join(globalThis.directoryRoot, '/.cache/wpe-scopes.js'),
      `export * as _04a5fd4a912092212894c198071f22d5 from '../src/pages/first-scope/second-scope/wrap-pages.js';
export * as _a8e85ae8b0a005f5a28a5cb14cf5a31b from '../src/pages/first-scope/wrap-pages.js';
export * as _de24c938e6d0ae34eea46b0360bc707c from '../src/pages/wrap-pages.js';`,
      null,
      expect.any(Function)
    )
  })

  it('should contain wrapper details with "none" as the same scope', async () => {
    const pages = [
      getPage('src/pages/first-scope/second-scope/third-scope/index.js'),
      getPage('src/pages/first-scope/second-scope/wrap-pages.js'),
      getPage('src/pages/first-scope/second-scope/index.js'),
      getPage('src/pages/first-scope/second-scope/wrap-pages.js'),
      getPage('src/pages/first-scope/index.js'),
      getPage('src/pages/first-scope/wrap-pages.js'),
      getPage('src/pages/index.js'),
      getPage('src/pages/wrap-pages.js'),
    ]
    await handleWrapperScopesAndPages(getParams({ pages }))

    const page = pages[0] // get the first page
    const pageData = page[1] // select page content
    expect(pageData.context).toMatchObject({
      WPS: [
        { hash: '04a5fd4a912092212894c198071f22d5' },
        { hash: 'a8e85ae8b0a005f5a28a5cb14cf5a31b' },
        { hash: 'de24c938e6d0ae34eea46b0360bc707c' },
      ],
    })
  })

  it('should match the page hash with the wrapper hash', async () => {
    const pages = [
      getPage('src/pages/index.js'),
      getPage('src/pages/first-scope/index.js'),
      getPage('src/pages/first-scope/second-scope/index.js'),
      getPage('src/pages/first-scope/second-scope/third-scope/index.js'),
      getPage('src/pages/wrap-pages.js'),
      getPage('src/pages/first-scope/wrap-pages.js'),
      getPage('src/pages/first-scope/second-scope/wrap-pages.js'),
    ]
    await handleWrapperScopesAndPages(getParams({ pages }))

    // main scope
    expect(pages[0][1].context.WPS).toHaveLength(1)
    expect(pages[4][1].scopeData.relativeComponentHash).toBe(
      pages[0][1].context.WPS[0].hash
    )

    // first scope
    expect(pages[1][1].context.WPS).toHaveLength(2)
    expect(pages[5][1].scopeData.relativeComponentHash).toBe(
      pages[1][1].context.WPS[0].hash
    )
    expect(pages[4][1].scopeData.relativeComponentHash).toBe(
      pages[1][1].context.WPS[1].hash
    )

    // second scope
    expect(pages[2][1].context.WPS).toHaveLength(3)
    expect(pages[6][1].scopeData.relativeComponentHash).toBe(
      pages[2][1].context.WPS[0].hash
    )
    expect(pages[5][1].scopeData.relativeComponentHash).toBe(
      pages[2][1].context.WPS[1].hash
    )
    expect(pages[4][1].scopeData.relativeComponentHash).toBe(
      pages[2][1].context.WPS[2].hash
    )

    // third scope
    expect(pages[3][1].context.WPS).toHaveLength(3)
    expect(pages[6][1].scopeData.relativeComponentHash).toBe(
      pages[3][1].context.WPS[0].hash
    )
    expect(pages[5][1].scopeData.relativeComponentHash).toBe(
      pages[3][1].context.WPS[1].hash
    )
    expect(pages[4][1].scopeData.relativeComponentHash).toBe(
      pages[3][1].context.WPS[2].hash
    )
  })
})
