'use strict'
const path = require('path');
const utils = require('./utils');

let buildEntries = {};

for (let moduleName of utils.deployModule) {
  buildEntries[moduleName] = [
    'babel-polyfill',
    path.join(utils.resolve('src'), 'modules', moduleName, 'main.js')
  ]
}

module.exports = buildEntries;
