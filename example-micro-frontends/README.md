# Micro Frontends

Gatsby can be used to build UX focused micro frontends, where everything is page based and optimized for a fantastic user and a11y experience – while still deliver micro frontend independence in terms of DX and dedicated developer teams.

But the only piece missing is to easily customize what layout and what data provider is used by every micro application.

Now, **gatsby-plugin-wrap-pages** can be included by every "mirco app" independently. They even can define what they want to call the wrapper files (`wrapperName`) by itself. Or if that matters, it can be used just by one micro app – even if the root application is not aware of this plugin.

Live [Demo](https://tujoworker.github.io/gatsby-plugin-wrap-pages/example-micro-frontends/) 🚀 provided by this ☝️ [example code](https://github.com/tujoworker/gatsby-plugin-wrap-pages/tree/main/example-micro-frontends).

## How it works

It uses a main application (root application) to bundle the whole application, which includes the micro applications as Gatsby Themes.

Every micro application will be included inside `gatsby-config.js` as a plugin. The order does matter. The last application will have presence over the previews one. Therefore, your pages will have to be nested inside separate directories:

```js
micro-app-a/
├── src/
│   └── pages/
│       └── micro-app-a/
│           └── … // pages that belongs to micro-app-a
micro-app-b/
├── src/
│   └── pages/
│       └── micro-app-b/
│           └── … // pages that belongs to micro-app-b
main-application/
├── src/
│   └── pages/
│       └── wrap-pages.tsx // ← e.g. wrapPagesDeep(<MainLayout>)
└── gatsby-config.json // includes all micro apps
```

## What about user data?

Only because Gatsby builds pages, available as static assets, means NOT your user data needs to be a part of that output.

Think of pages more like a Native Mobile app – they contain the needed layout and styling and are instantly available. But once your application needs to display user data, you request it and replace your skeletons or loaders with the user content.

## The benefits of using Gatsby

- Extremely stable and robust due to the fact that all the production builds are served as static files only (JAMStack). No server downtime and maintenance etc.
- The fact that every page is rendered during release (SSR) will help dramatically to find render issues before they hit the user.
- Incremental builds (build only new pages) by reusing the cache is a core feature of Gatsby.
- Page preloading is provided "out of the box".
- Code-splitting per page basis.
- Comprehensive automatic end-to-end (e2e) tests can be run in the same CI / CD process before / during main launch. This will make sure to test the functionality throughout the various applications - without any major work and complexity.
- Apps can be run for development independently and in isolation or in combination as a whole.
- Cab be easily versionized.
  - The result: Good overview of all applications and its versions and its features and progress. More transparency in other words to everyone involved.
  - Very easy to reverse to previous version since all applications / parts have a version history.
- Sharing reusable code across applications is very easy.
- Building applications like that will resulting in an incredibly much better user experience. A page visit happens instantly.
