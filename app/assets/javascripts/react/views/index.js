// requireBulk = require('bulk-require')
// module.exports = requireBulk(__dirname, [ '*.cjsx', '*/*.cjsx' ])
//
// NEW FOR WEBPACK

const fromPairs = require('lodash/fromPairs')
const camelCase = require('lodash/camelCase')

const webpackBulkRequire = require.context('./', true, /\.(c?jsx?)/)
const bulk = webpackRequire
  .keys().filter((key) => key !== './index.js')

module.exports = f(bundle)
  .map((key) => [camelCase(key), webpackRequire(key)])
  .fromPairs(bundle)
