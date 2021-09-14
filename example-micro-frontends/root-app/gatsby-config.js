module.exports = {
  pathPrefix: '/gatsby-plugin-wrap-pages/example-micro-frontends',
  plugins: [
    // 'gatsby-plugin-wrap-pages',
    {
      resolve: 'gatsby-plugin-wrap-pages',
      options: { wrapperName: 'main-layout.tsx' },
    },

    // List all micro apps
    '@micro-app/one',
    '@micro-app/two',
    '@micro-app/home', // takes presence over all above
  ],
}
