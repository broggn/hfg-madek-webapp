// NOTE: only build JS! could also compile SASS to CSS but not sure if worth it

const webpack = require('webpack')
const path = require('path')

module.exports = {

  // Set 'context' for Rails Asset Pipeline
  context: path.join(__dirname, '/app/assets/javascripts'),

  entry: {
    application: [
      'webpack-dev-server/client?http://localhost:3333/assets/',
      'webpack/hot/only-dev-server',
      './application.coffee'
    ]
  },

  output: {
    filename: '[name]_bundle.js', // Will output application_bundle.js
    path: path.join(__dirname, '/app/assets/javascripts'), // Save to Rails Asset Pipeline
    publicPath: 'http://localhost:3333/assets' // Required for webpack-dev-server
  },

  // Require the webpack and react-hot-loader plugins
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],

  resolve: {
    extensions: ['', '.js', '.jsx']
  },

  module: {
    loaders: [
      // Load the react-hot-loader
      { test: /\.jsx?$/, loaders: ['babel-loader'], exclude: /node_modules/ },

      // legacy: coffee+coffee-jsx
      { test: /\.cjsx$/, loaders: ['coffee', 'cjsx'] },
      { test: /\.coffee$/, loader: 'coffee' }
    ]
  }
}
