// "bulk-require", webpack specific
const webpackBulkRequire = require.context('./', true, /\.(c?jsx?)/)
const bulk = webpackRequire
  .keys().filter((key) => key !== './index.js')

const UILibrary = bulk.map((key) => [key, webpackRequire(key)])
module.exports = UILibrary
