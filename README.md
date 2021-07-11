# Gatsby Plugin for wrapping pages

With this plugin you can add wrappers inside the pages directory. It will wrap pages within certain directories.

Why? Everything is possible with vanilla Gatsby – what this Plugin offers, is just a different, yet declarative way of wrapping your pages.

```js
my-project/
├── src/
│   └── pages/
│       ├── wrap-pages.js // ← wrapPagesDeep()
│       └── your-path/
│           ├── wrap-pages.js // ← wrapPages()
│           ├── index.js
│           ├── page-foo.js
│           ├── …
│           └── more-nested-paths/
│               ├── wrap-pages.js // ← wrapPages()
│               ├── index.js
│               ├── page-bar.js
│               └── …
├── package.json
└── gatsby-config.json
```

It supports:

- TypeScript
- Wrap your pages with HTML Elements, React Components or Providers
- Wrap pages in current directory
- Wrap pages deep (nested)
- Nested wrappers
- Programmatically created pages
- SSR (SSG) and client-side rendering with the same wrapper
- Customize the name of the wrapper file

## How to use

Inside `/src/pages/your-path` or `/src/pages/your-path/more-nested-paths` you add wrapper files named:

- `wrap-pages.js` (or `.tsx`).

### Wrap pages at the current scope

All your pages in that specific directory will be wrapped with `<main>[current page]</main>`.

- Add a wrapper function called `wrapPages` like so:

```jsx
export function wrapPages({ element }) {
  return <main>{element}</main>
}
```

### Wrap nested pages

All your pages, including the ones in nested directories, will be wrapped in `<YourProvider>`.

- Add a function called `wrapPagesDeep`:

```jsx
export function wrapPagesDeep({ element }) {
  return <YourProvider>{element}</YourProvider>
}
```

**NB:** It will also be used for the current directory scope, if `wrapPages` is not given.

... and yes, you can do both:

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

## Install

```bash
npm install gatsby-plugin-wrap-pages
# or
yarn add gatsby-plugin-wrap-pages
```

... and add it to your `gatsby-config.js` file:

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
+    wrapPageWith: '/src/pages/where-my/wrapper-is'
  },
})
```

## Known issues

### In development mode

- When adding or deleting a `wrap-pages.js` file, you may see a "file did not exists" error masse for a second. It should normally resolve. Try a hard refresh if not. In worst case, you may have to restart the development server. This also can happen when adding or deleting pages.
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
