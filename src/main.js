import Vue from 'vue'
import iView from 'iview'
import router from './router'
// import store from './store'
import App from './app.vue'
import 'iview/dist/styles/iview.css'

Vue.use(iView)

new Vue({
  el: '#app',
  router: router,
  // store,
  render: h => h(App)
})
