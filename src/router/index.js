import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import UserLocation from '@/pages/UserLocation'
import CloseBy from '@/pages/CloseBy'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path : '/',
      component: UserLocation
    },{
      path:'/close-by',
      component:CloseBy
    }
  ]
})
