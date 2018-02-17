'use strict'

// Modules
var webpack = require('webpack')
var autoprefixer = require('autoprefixer')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var CopyWebpackPlugin = require('copy-webpack-plugin')

var ENV = process.env.npm_lifecycle_event
var isTest = ENV === 'test' || ENV === 'test-watch'
var isProd = ENV === 'build'

module.exports = (function makeWebpackConfig () {
  var config = {}

  config.entry = isTest
    ? void 0
    : {
      app: './src/app/app.js'
    }

  config.output = isTest
    ? {}
    : {
      path: __dirname + '/dist',
      publicPath: isProd ? '/' : 'http://0.0.0.0:8080/',
      filename: isProd ? '[name].[hash].js' : '[name].bundle.js',

      // Filename for non-entry points
      // Only adds hash in build mode
      chunkFilename: isProd ? '[name].[hash].js' : '[name].bundle.js'
    }

  if (isTest) {
    config.devtool = 'inline-source-map'
  } else if (isProd) {
    config.devtool = 'source-map'
  } else {
    config.devtool = 'eval-source-map'
  }

  // Loaders JS, CSS, ASSET, HTML :
  // Initialize module
  config.module = {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader: isTest
          ? 'null-loader'
          : ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader: [
              { loader: 'css-loader', query: { sourceMap: true } },
              { loader: 'postcss-loader' },
              { loader: 'style!css!sass' }
            ]
          })
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
        loader: 'file-loader'
      },
      {
        test: /\.html$/,
        loader: 'raw-loader'
      }
    ]
  }

  // ISTANBUL LOADER
  // https://github.com/deepsweet/istanbul-instrumenter-loader
  // Instrument JS files with istanbul-lib-instrument for subsequent code coverage reporting
  // Skips node_modules and files that end with .spec.js
  if (isTest) {
    config.module.rules.push({
      enforce: 'pre',
      test: /\.js$/,
      exclude: [/node_modules/, /\.spec\.js$/],
      loader: 'istanbul-instrumenter-loader',
      query: {
        esModules: true
      }
    })
  }

  /**
   * PostCSS
   * Reference: https://github.com/postcss/autoprefixer-core
   * Add vendor prefixes to your css
   */
  // NOTE: This is now handled in the `postcss.config.js`
  //       webpack2 has some issues, making the config file necessary

  /**
   * Plugins
   * Reference: http://webpack.github.io/docs/configuration.html#plugins
   * List: http://webpack.github.io/docs/list-of-plugins.html
   */
  config.plugins = [
    new webpack.LoaderOptionsPlugin({
      test: /\.scss$/i,
      options: {
        postcss: {
          plugins: [autoprefixer]
        }
      }
    })
  ]

  // Skip rendering index.html in test mode
  if (!isTest) {
    // Render index.html
    config.plugins.push(
      new HtmlWebpackPlugin({
        template: './src/public/index.html',
        inject: 'body'
      }),
      // Extract css files
      // Disabled when in test mode or not in build mode
      new ExtractTextPlugin({
        filename: 'css/[name].css',
        disable: !isProd,
        allChunks: true
      })
    )
  }

  // Add build specific plugins
  if (isProd) {
    config.plugins.push(
      // Only emit files when there are no errors
      new webpack.NoErrorsPlugin(),
      // Dedupe modules in the output
      new webpack.optimize.DedupePlugin(),
      // Minify all javascript, switch loaders to minimizing mode
      new webpack.optimize.UglifyJsPlugin(),
      // Copy assets from the public folder
      new CopyWebpackPlugin([
        {
          from: __dirname + '/src/public'
        }
      ])
    )
  }

  // Dev server configuration
  config.devServer = {
    contentBase: './src/public',
    stats: 'minimal',
    host: '0.0.0.0'
  }

  return config
})()
