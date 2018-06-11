import Vue from 'vue'
import Router from 'vue-router'

import Main from '@/views/Main/index'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [{
      path: '/',
        name: 'home',
      component: Main}
      ]
})
