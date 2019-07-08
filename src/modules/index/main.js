import Vue from 'vue'
import router from './router'
import App from './App'
import promise from 'es6-promise'
promise.polyfill()

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
