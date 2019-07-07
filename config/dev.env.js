'use strict'
// const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = Object.assign({}, prodEnv, {
  NODE_ENV: '"development"',
  API_URL: '"/backend"',
  deployModule: [], // 空数组默认打包所有模块
  // 2018.05.18优化版暂不支持如下配置
  moduleFilter: [], // 过滤不需要的模块
  routerFilter: [], // 过滤不需要要的路由
  enableFilter: true
})
