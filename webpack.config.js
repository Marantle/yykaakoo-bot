const webpack = require('webpack')

module.exports = {
  node: {
    fs: "empty"
  },
  resolve: {
    mainFields: ["main", "module"]
  },
  devtool: 'source-map',
  performance: false,
  target: 'node'
};