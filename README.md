# Gatsby Plugin for wrapping pages

With this plugin you can add (nested) wrappers inside the pages directory. It will give you declaratively control of what pages you wrap with either HTML elements or React Providers.

```js
my-project/
├── src/
│   └── pages/
│       ├── wrap-pages.js // ← wrapPagesDeep()
│       └── your-path/
│           ├── wrap-pages.js // ← wrapPages()
│           ├── index.js
│           ├── foo.js
│           ├── …
│           └── more-nested-paths/
│               ├── wrap-pages.js // ← wrapPages()
│               ├── index.js
│               ├── bar.js
│               └── …
├── package.json
└── gatsby-config.json
```

Why? Everything is possible with vanilla Gatsby – what this Plugin offers, is a different, yet declarative way of wrapping your pages.

It supports:

- TypeScript
- Gatsby Themes and Plugins
- Gatsby Plugins used as [Micro Frontends](https://www.youtube.com/watch?v=0Ta-awtLZTs)
- SSR (SSG) and client-side rendering with the same wrapper
- Wrap your pages with HTML Elements, React Components or Providers
- Wrap pages in current directory
- Wrap pages deep (nested)
- Nested wrappers
- Programmatically created pages
- Custom name of the wrapper file

Live [Demo](https://gatsby-plugin-wrap-pages.netlify.app/) 🚀 provided by the [example code](https://github.com/tujoworker/gatsby-plugin-wrap-pages/tree/main/example).

## How to use

Create a file called `wrap-pages.js` (or `.tsx`) inside `/src/pages/...somewhere` with a named export function. That's it.

The parameters of that function are the same as Gatsby's API [`wrapPageElement`](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/#wrapPageElement), including the `element`, which we now can return – but modified.

### Wrap pages at the current scope

- Add a wrapper function named `wrapPages`:

```jsx
export function wrapPages({ element }) {
  return <div>{element}</div>
}
```

Pages in that specific directory will be wrapped with `<div>[current page]</div>`.

### Wrap nested pages

- Add a function named `wrapPagesDeep`:

```jsx
export function wrapPagesDeep({ element }) {
  return <YourProvider>{element}</YourProvider>
}
```

All your pages, including the ones in nested directories, will be wrapped in `<YourProvider>`.

**NB:** It will also be used for the current directory scope, if `wrapPages` is not given.

... and yes, you can have both:

```jsx
// wraps pages in the current scope
export function wrapPages({ element }) {
  return <Layout-A>{element}</Layout-A>
}

// wraps all nested pages (deep)
export function wrapPagesDeep({ element }) {
  return <Layout-B>{element}</Layout-B>
}
```

### Nested wrappers

You can have as many nested wrappers as you like:

```js
my-project/
├── src/
│   └── pages/
│       ├── wrap-pages.js // ← One
│       └── directory/
│           ├── wrap-pages.js // ← Two
│           ├── …
│           └── directory/
│               ├── wrap-pages.js // ← Three
│               └── …
```

## Install

```bash
npm install gatsby-plugin-wrap-pages
# or
yarn add gatsby-plugin-wrap-pages
```

… and add it to your `gatsby-config.js` file:

```diff
exports.plugins = [
+	'gatsby-plugin-wrap-pages'
]
```

## Plugin Options

You want to call the `wrap-pages.js` (or `.tsx`) file something different?

```cjs
exports.plugins = [
  {
    resolve: 'gatsby-plugin-wrap-pages',
    options: {
      wrapperName: 'yourWrapperName.tsx',
    },
  },
]
```

## Programmatically created pages

If you create some pages with the Gatsby API `createPage` "programmatically", and you also want these pages to get wrapped, you can provide `wrapPageWith` in the page context. Simply use a relative path (with a dot) or an absolute path and point to the directories where these wrappers are located – typical inside `./src/pages/...`.

```diff
createPage({
  path: '/page-path',
  component: systemPath.resolve('./src/templates/your-page-component.js'),
  context: {
+    wrapPageWith: './src/pages/where-my/wrapper-is/'
  },
})
```

## FAQ

### About performance and size

_Does it negatively impact the performance of my production build?_

No. It should not have an impact negatively compared to other solutions done differently. The technique relies on function calls only.

_Does it increase the size of my production build?_

Not really. Every page gets assigned one or more hashes, but this should not really make your production build significantly larger.

_Does it negatively interfere with Webpack tree shaking?_

Not really. All the production code from the wrappers will be a part of the `app-[hash].js` bundle, because this code gets shared with several pages.

If you use a large amount of JavaScript on only one page, you should put this code inside the page it belongs to. Webpack will then create a dedicated bundle for that page only.

### Known issues in development mode

- When adding or deleting a `wrap-pages.js` file, you may see a "file did not exists" error masse for a second. It should normally resolve. Try a hard refresh – if not. In worst case, you may have to restart the development server. This also can happen when adding or deleting pages.
- On the initial first save to refresh, you may have to "save" twice to see force fast refresh to actually show the changes.

## How it works

This description is simplified and the order of all the steps is not 100% as described. Also, during development, we only touch actually effected files.

1. Check all available pages if there is a file called `wrap-pages` (_wrapperName_).

2. We don't want it to be a page, so we delete it from the pages map.

3. But we keep this "page" it in our local cache, together with the directory "scope" it is located in.

4. We also create a reference file inside the Gatsby cache folder: `.cache/wpe-scopes.js`. It includes the imports of our wrapper file along with a _hash_.

5. Now we compare the pages directory with a matching wrapper "scope". If there is a match, we put a _hash_ in the page context.

6. The plugin uses Gatsby's API `wrapPageElement` and checks if a matching _hash_ is in the current page context.

### Why use onCreateDevServer?

Now, things would have been very much easier, if this plugin not would support development mode, with support for resolving file changes on the disk on the fly.

The Gatsby `onCreateDevServer` is the last one during warm up, so we add our file change listeners inside this API.

We listen for `CREATE_PAGE` to update everything related, both when a page gets created or a new wrapper file gets created.

We also listen for `unlink` so we can update related pages when a wrapper gets deleted.
