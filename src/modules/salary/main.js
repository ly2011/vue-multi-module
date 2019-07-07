import promise from 'es6-promise'
promise.polyfill()

import Vue from 'vue'
import App from './App'

new Vue({
  render: h => h(App)
}).$mount('#app')
