'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin-for-multihtml')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')
// const glob = require('glob')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

// // 多文件扫描
// let pages = (globalPath => {
//   let htmlFiles = {},
//     pageName

//   glob.sync(globalPath).forEach(pagePath => {
//     let basename = path.dirname(pagePath).split('/')
//     basename = basename[basename.length - 1]
//     pageName = basename
//     if (utils.deployModule.includes(pageName)) {
//       htmlFiles[pageName] = {}
//       htmlFiles[pageName]['chunk'] = basename
//       htmlFiles[pageName]['path'] = pagePath
//     }
//   })
//   return htmlFiles
// })(utils.resolve('src') + '/modules/*/index.html')

// // devServer重定向数组
// let rewrites = (pages => {
//   let rewritesArr = []
//   for (let entryName in pages) {
//     rewritesArr.push({
//       from: new RegExp(`(/#)?/${entryName}`),
//       to: path.posix.join(config.dev.assetsPublicPath, `${entryName}.html`)
//     })
//   }
//   rewritesArr.push({
//     from: /.*/,
//     to: path.posix.join(config.dev.assetsPublicPath, 'index.html')
//   })
//   return rewritesArr
// })(pages)

// for (let entryName in pages) {
//   let conf = {
//     // 生成出来的html文件名
//     filename: entryName + '.html',
//     // 每个html的模版，这里多个页面使用同一个模版
//     template: pages[entryName]['path'],
//     // 自动将引用插入html
//     inject: true,
//     // favicon: path.resolve('favicon.ico'),
//     // 每个html引用的js模块，也可以在这里加上vendor等公用模块
//     chunks: ['vendor', 'manifest', pages[entryName]['chunk']],
//     multihtmlCache: true // 缓存多页面打包的内容，提高打包速度
//   }
//   /* 入口文件对应html文件（配置多个，一个页面对应一个入口，通过chunks对应） */
//   devWebpackConfig.plugins.push(new HtmlWebpackPlugin(conf))
// }

const pages = utils.getEntry(utils.resolve('src') + '/modules/*/index.html')
const rewrites = utils.rewrites(pages)
const htmlTemplatesPlugins = utils.getHtmlTemplates(pages)

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,
  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: {
      // rewrites: [
      //   {
      //     from: /.*/,
      //     to: path.posix.join(config.dev.assetsPublicPath, 'index.html')
      //   }
      // ]
      rewrites
    },
    hot: true,
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    disableHostCheck: true,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    // proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': config.dev.env
    }),
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new FriendlyErrorsPlugin(),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ]),
    ...htmlTemplatesPlugins
  ]
})

// module.exports = devWebpackConfig;
module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(
        new FriendlyErrorsPlugin({
          compilationSuccessInfo: {
            messages: [
              `Your application is running here: http://${
                devWebpackConfig.devServer.host
              }:${port}`
            ]
          },
          onErrors: config.dev.notifyOnErrors
            ? utils.createNotifierCallback()
            : undefined
        })
      )

      resolve(devWebpackConfig)
    }
  })
})
