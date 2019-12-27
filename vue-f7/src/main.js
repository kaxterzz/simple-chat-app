import Vue from 'vue'
// Import F7 Bundle
import Framework7 from 'framework7/framework7.esm.bundle.js'

// Import F7-Vue Plugin Bundle (with all F7 components registered)
import Framework7Vue from 'framework7-vue/framework7-vue.esm.bundle.js'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false
// Init F7-Vue Plugin
Framework7.use(Framework7Vue);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
