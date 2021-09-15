# Gatsby Plugin for wrapping pages

With this plugin you can add (nested) wrappers inside the pages directory. It will give you declaratively control of what pages you wrap with either HTML elements or React Providers.

```js
my-project/
├── src/
│   └── pages/
│       ├── wrap-pages.tsx // ← wrapPagesDeep(<Layout>)
│       ├── index.tsx
│       └── your-path/
│           ├── wrap-pages.tsx // ← wrapPagesDeep(<Layout>)
│           ├── index.tsx
│           ├── … // more pages
│           └── more-nested-paths/
│               ├── wrap-pages.js // ← wrapPages(<Provider>)
│               ├── index.js
│               └── … // more pages
├── package.json
└── gatsby-config.json
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

## How to use

Create a file called `wrap-pages.js` (or `.tsx`) inside `/src/pages/...somewhere` with a named export function. That's it.

The parameters of that function are the same as Gatsby's API [`wrapPageElement`](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/#wrapPageElement), including the `element`, which we now can return – but modified.

### Wrap pages at the current scope

- Add a wrapper function named `wrapPages`:

```jsx
// Inside wrap-pages.js (or.tsx)
export function wrapPages({ element }) {
  return <div>{element}</div>
}
```

Pages in that specific directory will be wrapped with `<div>[current page]</div>`.

### Wrap nested pages

- Add a function named `wrapPagesDeep`:

```jsx
// Inside wrap-pages.js (or.tsx)
export function wrapPagesDeep({ element }) {
  return <YourProvider>{element}</YourProvider>
}
```

All your pages, including the ones in nested directories, will be wrapped in `<YourProvider>`.

---

Read more about [how to use this plugin](https://github.com/tujoworker/gatsby-plugin-wrap-pages) on GitHub.
