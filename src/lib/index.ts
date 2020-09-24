import zPay from './pay.vue';

const payPanel = {
  install(Vue: any) {
    //  注册为组件 'Pay'是组件名
    Vue.component('Pay', zPay);
  },
};
//  导出组件，在main.js中通过Vue.use()使用插件
export default payPanel;
