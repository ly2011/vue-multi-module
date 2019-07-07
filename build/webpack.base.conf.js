'use strict'
const chalk = require('chalk')
const { resolve, assetsPath } = require('./utils')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')

const buildEntries = require('./build-entries')

const createLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [resolve('src')],
  exclude: [],
  options: {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
})

let webpackConfig = {
  entry: buildEntries,
  output: {
    path: config.build.assetsRoot, // 编译后文件的存放目录
    filename: '[name].js',
    publicPath:
      process.env.NODE_ENV === 'production'
        ? config.build.assetsPublicPath
        : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    modules: [resolve('src'), resolve('node_modules')],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '@': resolve('src'),
      assets: resolve('src/assets'),
      '@components': resolve('src/components'),
      '@styles': resolve('src/assets/styles'),
      '@common': resolve('src/components/common'),
      '@login': resolve('src/modules/login'),
      '@salary': resolve('src/modules/salary')
    }
  },
  module: {
    noParse: /node_modules\/(element-ui\.js)/,
    rules: [
      ...(config.dev.useEslint ? [createLintingRule()] : []),
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [
          resolve('src')
          // resolve('node_modules/webpack-dev-server/client')
        ],
        query: { compact: false }
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  },
  plugins: [
    new ProgressBarPlugin({
      format:
        '  build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)'
    })
  ]
}

module.exports = webpackConfig
