import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import About from './views/About.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  // fallback: false,
  routes: [
    {
      path: '/',
      redirect: '/salary'
    },
    {
      path: '/salary',
      // name: 'home',
      component: Home
    },
    {
      path: '/salary/about',
      // name: 'about',
      component: About
    },
    {
      path: '/salary*',
      redirect: '/'
    }
  ]
})
