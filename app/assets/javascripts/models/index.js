// NEW FOR WEBPACK

const fromPairs = require('lodash/fromPairs')
const camelCase = require('lodash/camelCase')

const webpackBulkRequire = require.context('./', true, /\.js/)
const bulk = webpackRequire
  .keys().filter((key) => key !== './index.js')

const Models = fromPairs(
  bundle.map((key) => [camelCase(key), webpackRequire(key)]))

module.exports = Models
