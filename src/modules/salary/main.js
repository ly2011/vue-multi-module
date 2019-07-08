import Vue from 'vue'
import promise from 'es6-promise'
import router from './router'
import App from './App'
promise.polyfill()

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
