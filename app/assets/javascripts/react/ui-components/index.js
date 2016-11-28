// requireBulk = require('bulk-require')
//
// UILibrary = requireBulk(__dirname, [ '*.cjsx' ])
// UILibrary.propTypes = require('./propTypes.coffee')
//
// module.exports = UILibrary

// NEW FOR WEBPACK

const fromPairs = require('lodash/fromPairs')

const webpackBulkRequire = require.context('./', true, /\.(c?jsx?)/)
const bulk = webpackRequire
  .keys().filter((key) => key !== './index.js')

const UILibrary = bulk.map((key) => [key, webpackRequire(key)])
module.exports = UILibrary
