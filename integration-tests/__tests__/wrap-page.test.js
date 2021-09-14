import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  wrapPageElement,
  renewRenderCycle,
} from 'gatsby-plugin-wrap-pages/wrap-pages'
import * as mainScopeWrapper from '../__mocks__/src/pages/wrap-pages'
import * as firstScopeWrapper from '../__mocks__/src/pages/first-scope/wrap-pages'
import * as secondScopeWrapper from '../__mocks__/src/pages/first-scope/second-scope/wrap-pages'

const Page = () => {
  return <div data-testid="content">Page Content</div>
}

beforeEach(() => {
  renewRenderCycle()
  jest.restoreAllMocks()
})

describe('wrapPageElement', () => {
  const args = {
    element: <Page />,
    props: {
      pageContext: {
        WPS: [
          { hash: '26243a013ca7d319d87081f9768dd680', isSame: true },
          { hash: '455a0f696332624bb2ff3f910434400d' },
          { hash: 'de24c938e6d0ae34eea46b0360bc707c' },
        ],
      },
    },
  }
  const initRender = () => {
    render(wrapPageElement(args))
  }

  it('should call wrapper functions', () => {
    const mainWrapper = jest.fn()
    const firstWrapper = jest.fn()
    const secondWrapper = jest.fn()

    jest
      .spyOn(mainScopeWrapper, 'wrapPagesDeep')
      .mockImplementation(mainWrapper)

    jest
      .spyOn(firstScopeWrapper, 'wrapPagesDeep')
      .mockImplementation(firstWrapper)

    jest
      .spyOn(secondScopeWrapper, 'wrapPages')
      .mockImplementation(secondWrapper)

    initRender()

    expect(mainWrapper).toBeCalledTimes(1)
    expect(mainWrapper).toHaveBeenCalledWith(args)

    expect(firstWrapper).toBeCalledTimes(1)
    expect(firstWrapper).toHaveBeenCalledWith(args)

    expect(secondWrapper).toBeCalledTimes(1)
    expect(secondWrapper).toHaveBeenCalledWith(args)
  })

  it('should bypass invalid returned elements', () => {
    const mainWrapper = jest.fn(() => {
      return undefined
    })

    jest
      .spyOn(mainScopeWrapper, 'wrapPagesDeep')
      .mockImplementation(mainWrapper)

    initRender()

    expect(mainWrapper).toBeCalledTimes(1)
    expect(mainWrapper).toHaveBeenCalledWith(args)

    const pageElem = screen.getByTestId('content')
    expect(pageElem.textContent).toBe('Page Content')
  })
})

describe('wrapPagesDeep', () => {
  beforeEach(() => {
    render(
      wrapPageElement({
        element: <Page />,
        props: {
          pageContext: {
            WPS: [
              { hash: '26243a013ca7d319d87081f9768dd680' },
              { hash: '455a0f696332624bb2ff3f910434400d' },
              { hash: 'de24c938e6d0ae34eea46b0360bc707c' },
            ],
          },
        },
      })
    )
  })

  it('should contain original content', () => {
    const pageElem = screen.getByTestId('content')
    expect(pageElem.textContent).toBe('Page Content')
  })

  it('should wrap additional header', () => {
    const headerElem = screen.getByRole('header')
    expect(headerElem instanceof HTMLElement).toBe(true)
  })

  it('should match snapshot', () => {
    const bodyElem = document.querySelector('body')
    expect(bodyElem).toMatchSnapshot()
  })

  it('should wrap in correct order', () => {
    const elements = document.querySelectorAll('body div[data-testid]')
    expect(elements[0].getAttribute('data-testid')).toBe('wrapPagesDeep-main')
    expect(elements[1].getAttribute('data-testid')).toBe('wrapPagesDeep-first')
    expect(elements[2].getAttribute('data-testid')).toBe('wrapPagesDeep-second')
  })
})

describe('wrapPages on second last page', () => {
  beforeEach(() => {
    render(
      wrapPageElement({
        element: <Page />,
        props: {
          pageContext: {
            WPS: [
              { hash: '26243a013ca7d319d87081f9768dd680' },
              { hash: '455a0f696332624bb2ff3f910434400d', isSame: true },
              { hash: 'de24c938e6d0ae34eea46b0360bc707c' },
            ],
          },
        },
      })
    )
  })

  it('should contain original content', () => {
    const pageElem = screen.getByTestId('content')
    expect(pageElem.textContent).toBe('Page Content')
  })

  it('should wrap additional header', () => {
    const headerElem = screen.getByRole('header')
    expect(headerElem instanceof HTMLElement).toBe(true)
  })

  it('should match snapshot', () => {
    const bodyElem = document.querySelector('body')
    expect(bodyElem).toMatchSnapshot()
  })

  it('should wrap in correct order', () => {
    const elements = document.querySelectorAll('body div[data-testid]')
    expect(elements[0].getAttribute('data-testid')).toBe('wrapPagesDeep-main')
    expect(elements[1].getAttribute('data-testid')).toBe('wrapPages-first')
    expect(elements[2].getAttribute('data-testid')).toBe('wrapPagesDeep-second')
  })
})

describe('wrapPages on last page', () => {
  beforeEach(() => {
    render(
      wrapPageElement({
        element: <Page />,
        props: {
          pageContext: {
            WPS: [
              { hash: '26243a013ca7d319d87081f9768dd680', isSame: true },
              { hash: '455a0f696332624bb2ff3f910434400d' },
              { hash: 'de24c938e6d0ae34eea46b0360bc707c' },
            ],
          },
        },
      })
    )
  })

  it('should wrap in correct order', () => {
    const elements = document.querySelectorAll('body div[data-testid]')
    expect(elements[0].getAttribute('data-testid')).toBe('wrapPagesDeep-main')
    expect(elements[1].getAttribute('data-testid')).toBe('wrapPagesDeep-first')
    expect(elements[2].getAttribute('data-testid')).toBe('wrapPages-second')
  })
})
