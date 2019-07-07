'use strict';
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const config = require('../config');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const packageConfig = require('../package.json');

exports.assetsPath = function (_path) {
  const assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory

  return path.posix.join(assetsSubDirectory, _path)
}

const resolve = function (dir) {
  return path.join(__dirname, '..', dir);
};

exports.resolve = resolve;

const allModules = (() => {
  let allModules = fs.readdirSync(path.join(resolve('src'), 'modules')) || [];
  // 过滤mac下多出的.DS_Store文件
  return allModules.filter(item => item !== '.DS_Store');
})();

exports.allModules = allModules

exports.deployModule = (() => {
  let moduleEnv = process.env.MODULE_ENV;
  if (!moduleEnv) return allModules;
  let modules = moduleEnv.split(',');

  // let argvs = process.argv.slice();
  // argvs.splice(0, 2);
  // let modules = argvs.map(argv => argv.replace(/-/g, ''));
  if (!modules.length) {
    return allModules;
  } else {
    return _.intersection(modules, allModules);
  }
})();

exports.cssLoaders = function (options) {
  options = options || {};

  const cssLoader = {
    loader: 'css-loader',
    options: {
      minimize: process.env.NODE_ENV === 'production',
      sourceMap: options.sourceMap
    }
  };

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap
    }
  };

  // generate loader string to be used with extract text plugin
  function generateLoaders (loader, loaderOptions) {
    const loaders = options.usePostCSS
      ? [cssLoader, postcssLoader]
      : [cssLoader];

    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      });
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'vue-style-loader'
      });
    } else {
      return ['vue-style-loader'].concat(loaders);
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  };
};

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  const output = [];
  const loaders = exports.cssLoaders(options);

  for (const extension in loaders) {
    const loader = loaders[extension];
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    });
  }

  return output;
};

exports.createNotifierCallback = () => {
  const notifier = require('node-notifier');

  return (severity, errors) => {
    if (severity !== 'error') return;

    const error = errors[0];
    const filename = error.file && error.file.split('!').pop();

    notifier.notify({
      title: packageConfig.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    });
  };
};
