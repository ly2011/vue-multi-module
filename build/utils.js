'use strict'
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const glob = require('glob')
const config = require('../config')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin-for-multihtml')
const packageConfig = require('../package.json')

exports.assetsPath = function(_path) {
  const assetsSubDirectory =
    process.env.NODE_ENV === 'production'
      ? config.build.assetsSubDirectory
      : config.dev.assetsSubDirectory

  return path.posix.join(assetsSubDirectory, _path)
}

const resolve = function(dir) {
  return path.join(__dirname, '..', dir)
}

exports.resolve = resolve

const allModules = (() => {
  let allModules = fs.readdirSync(path.join(resolve('src'), 'modules')) || []
  // 过滤mac下多出的.DS_Store文件
  return allModules.filter(item => item !== '.DS_Store')
})()

exports.allModules = allModules

const deployModule = (() => {
  let moduleEnv = process.env.MODULE_ENV
  if (!moduleEnv) return allModules
  let modules = moduleEnv.split(',')

  // let argvs = process.argv.slice();
  // argvs.splice(0, 2);
  // let modules = argvs.map(argv => argv.replace(/-/g, ''));
  if (!modules.length) {
    return allModules
  } else {
    return _.intersection(modules, allModules)
  }
})()

exports.deployModule = deployModule

exports.cssLoaders = function(options) {
  options = options || {}

  const cssLoader = {
    loader: 'css-loader',
    options: {
      minimize: process.env.NODE_ENV === 'production',
      sourceMap: options.sourceMap
    }
  }

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders(loader, loaderOptions) {
    const loaders = options.usePostCSS
      ? [cssLoader, postcssLoader]
      : [cssLoader]

    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'vue-style-loader'
      })
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function(options) {
  const output = []
  const loaders = exports.cssLoaders(options)

  for (const extension in loaders) {
    const loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }

  return output
}

exports.createNotifierCallback = () => {
  const notifier = require('node-notifier')

  return (severity, errors) => {
    if (severity !== 'error') return

    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()

    notifier.notify({
      title: packageConfig.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    })
  }
}

/**
 * 获取多模块的入口
 */
exports.getEntry = globalPath => {
  let htmlFiles = {},
    pageName

  glob.sync(globalPath).forEach(pagePath => {
    let basename = path.dirname(pagePath).split('/')
    basename = basename[basename.length - 1]
    pageName = basename
    if (deployModule.includes(pageName)) {
      htmlFiles[pageName] = {}
      htmlFiles[pageName]['chunk'] = basename
      htmlFiles[pageName]['path'] = pagePath
    }
  })
  return htmlFiles
}

/**
 * devServer重定向数组
 */
exports.rewrites = pages => {
  let rewritesArr = []
  for (let entryName in pages) {
    rewritesArr.push({
      from: new RegExp(`(/#)?/${entryName}`),
      to: path.posix.join(config.dev.assetsPublicPath, `${entryName}.html`)
    })
  }
  rewritesArr.push({
    from: /.*/,
    to: path.posix.join(config.dev.assetsPublicPath, 'index.html')
  })
  return rewritesArr
}

exports.getHtmlTemplates = (pages, isPro) => {
  let templatesArr = []
  for (let entryName in pages) {
    let conf = {
      // 生成出来的html文件名
      filename: entryName + '.html',
      // 每个html的模版，这里多个页面使用同一个模版
      template: pages[entryName]['path'],
      // 自动将引用插入html
      inject: true,
      minify: isPro
        ? {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true
            // more options:
            // https://github.com/kangax/html-minifier#options-quick-reference
        }
        : {},
      // favicon: path.resolve('favicon.ico'),
      // 每个html引用的js模块，也可以在这里加上vendor等公用模块
      chunks: ['vendor', 'manifest', pages[entryName]['chunk']],
      multihtmlCache: !isPro, // 测试环境缓存多页面打包的内容，提高打包速度
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }
    /* 入口文件对应html文件（配置多个，一个页面对应一个入口，通过chunks对应） */
    templatesArr.push(new HtmlWebpackPlugin(conf))
  }
  return templatesArr
}
