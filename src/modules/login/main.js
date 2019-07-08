import Vue from 'vue'
import App from './App'
import promise from 'es6-promise'
promise.polyfill()

new Vue({
  render: h => h(App)
}).$mount('#app')
