'use strict'
// const evt = process.env.npm_lifecycle_event;
const evt = process.env.DEPLOY_ENV || 'build'
let baseUrl, loginUrl, monitorSysId

switch (evt) {
  case 'dev':
    baseUrl = '"http://127.0.0.1:8080/backend"'
    loginUrl = '"http://127.0.0.1:8080/login"'
    monitorSysId = '"dev"'
    break
  default:
    baseUrl = '"http://127.0.0.1:8080/backend"'
    loginUrl = '"http://127.0.0.1:8080/login"'
    monitorSysId = '"dev"'
}

module.exports = {
  NODE_ENV: '"production"',
  API_URL: baseUrl,
  LOGIN_URL: loginUrl,
  // 性能监控平台注册id
  MONITOR_SYS_ID: monitorSysId,
  // 2018.05.18优化版暂不支持如下配置
  moduleFilter: [], // 过滤不需要的模块
  routerFilter: [], // 过滤不需要要的路由
  enableFilter: false
}
