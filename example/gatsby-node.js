const systemPath = require('path')

exports.createPages = async ({ actions }) => {
  const { createPage } = actions
  createPage({
    path: '/more-examples/second-page/third-page',
    component: systemPath.resolve('./src/templates/page-component.js'),
    context: {
      wrapPageWith: './src/pages/more-examples/second-page/third-page',
    },
  })
}
