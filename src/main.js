import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'

import * as d3 from 'd3'
Vue.use(d3)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
