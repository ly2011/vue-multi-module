'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// const ExtractTextPlugin = require('extract-text-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
const AutoDllPlugin = require('autodll-webpack-plugin')

const createVariants = require('parallel-webpack').createVariants
const baseOptions = {}
const variants = {
  target: utils.deployModule
}
/* webpack-merge 不满足需求 */
baseWebpackConfig.entry = {}

const commonOptions = {
  chunks: 'all',
  enforce: true,
  reuseExistingChunk: true
}

const wpConfigConstructor = options => {
  const webpackConfig = merge(baseWebpackConfig, {
    module: {
      rules: utils.styleLoaders({
        sourceMap: config.build.productionSourceMap,
        extract: true,
        usePostCSS: true
      })
    },
    devtool: config.build.productionSourceMap ? config.build.devtool : false,
    entry: {
      [options.target]: [
        'babel-polyfill',
        `./src/modules/${options.target}/main.js`
      ]
    },
    output: {
      path: path.resolve(config.build.assetsRoot, `${options.target}-dist`),
      // publicPath:
      //   (process.env.NODE_ENV === 'production'
      //     ? config.build.assetsPublicPath
      //     : config.dev.assetsPublicPath) + `${options.target}`,
      filename: utils.assetsPath('js/[name].[chunkhash].js'),
      chunkFilename: utils.assetsPath('js/[name].[chunkhash].js')
    },
    // https://www.cnblogs.com/lalalagq/p/9809174.html
    optimization: {
      namedChunks: true, // NamedChunksPlugin -> namedChunks: true
      moduleIds: 'hashed', // HashedModuleIdsPlugin -> moduleIds: hashed
      runtimeChunk: {
        name: 'manifest' // new webpack.optimize.CommonsChunkPlugin({name: 'manifest'}) -> runtimeChunk: {name: 'manifest'}
      },
      minimizer: [
        new ParallelUglifyPlugin({
          cacheDir: '.cache/',
          uglifyJS: {
            output: {
              comments: false
            },
            compress: {
              drop_console: true,
              drop_debugger: true
            }
          },
          sourceMap: config.build.productionSourceMap
        }),
        new OptimizeCSSPlugin({
          cssProcessorOptions: config.build.productionSourceMap
            ? { safe: true, map: { inline: false } }
            : { safe: true }
        })
      ],
      splitChunks: {
        maxInitialRequests: 5,
        cacheGroups: {
          vendors: {
            test: /node_modules/, // 表示默认拆分node_modules中的模块
            chunks: 'initial',
            name: 'vendors',
            priority: 10,
            ...commonOptions
          },
          styles: {
            test: /\.(css|less|sass|scss)$/,
            name: 'styles',
            chunks: 'all',
            minChunks: 2,
            ...commonOptions
          }
        }
      }
    },
    plugins: [
      // http://vuejs.github.io/vue-loader/en/workflow/production.html
      new webpack.DefinePlugin({
        'process.env': config.build.env
      }),
      /*       new ParallelUglifyPlugin({
        cacheDir: '.cache/',
        uglifyJS: {
          output: {
            comments: false
          },
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        },
        sourceMap: config.build.productionSourceMap
      }), */
      // extract css into its own file
      // new ExtractTextPlugin({
      //   filename: utils.assetsPath('css/[name].[contenthash].css')
      // }),
      ...[
        new MiniCssExtractPlugin({
          // Options similar to the same options in webpackOptions.output
          // both options are optional
          filename: utils.assetsPath('css/[name].[chunkhash].css'),
          chunkFilename: utils.assetsPath('js/[id].[chunkhash].css')
        })
      ],

      // Compress extracted CSS. We are using this plugin so that possible
      // duplicated CSS from different components can be deduped.
      // new OptimizeCSSPlugin({
      //   cssProcessorOptions: config.build.productionSourceMap ? { safe: true, map: { inline: false } } : { safe: true }
      // }),

      // new AutoDllPlugin({
      //   inject: true, // will inject the DLL bundle to index.html
      //   debug: true,
      //   filename: '[name]_[hash].js',
      //   path: './dll',
      //   entry: {
      //     vendor: ['vue', 'vue-router']
      //   }
      // }),

      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: `src/modules/${options.target}/index.html`,
        inject: true,
        minify: false,
        // minify: {
        //   removeComments: true,
        //   collapseWhitespace: true,
        //   removeAttributeQuotes: true
        //   // more options:
        //   // https://github.com/kangax/html-minifier#options-quick-reference
        // },
        chunks: ['vendors', 'manifest', options.target],
        // necessary to consistently work with multiple chunks via CommonsChunkPlugin
        chunksSortMode: 'dependency'
      }),

      new webpack.HashedModuleIdsPlugin(),
      // enable scope hoisting
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.optimize.AggressiveMergingPlugin(),

      /*       // split vendor js into its own file
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: function(module, count) {
          // any required modules inside node_modules are extracted to vendor
          return (
            module.resource &&
            /\.js$/.test(module.resource) &&
            module.resource.indexOf(path.join(__dirname, '../node_modules')) === 0
          )
        }
      }),
      // extract webpack runtime and module manifest to its own file in order to
      // prevent vendor hash from being updated whenever app bundle is updated
      new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
        chunks: ['vendor'],
        minChunks: Infinity
      }), */

      // copy custom static assets
      new CopyWebpackPlugin([
        {
          from: path.resolve(__dirname, '../static'),
          to: config.build.assetsSubDirectory,
          ignore: ['.*']
        }
      ])
    ]
  })

  if (config.build.productionGzip) {
    const CompressionWebpackPlugin = require('compression-webpack-plugin')

    webpackConfig.plugins.push(
      new CompressionWebpackPlugin({
        asset: '[path].gz[query]',
        algorithm: 'gzip',
        test: new RegExp(
          '\\.(' + config.build.productionGzipExtensions.join('|') + ')$'
        ),
        threshold: 10240,
        minRatio: 0.8
      })
    )
  }

  if (config.build.bundleAnalyzerReport) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
      .BundleAnalyzerPlugin
    webpackConfig.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerPort: 3009
      })
    )
  }
  return webpackConfig
}

module.exports = createVariants(baseOptions, variants, wpConfigConstructor)
