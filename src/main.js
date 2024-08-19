import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axiosInst from "@/service/AxiosConfig.js";
import VueCookies from "vue-cookies";

import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

Vue.config.productionTip = false;
Vue.$axios = Vue.prototype.$axios = axiosInst;
Vue.use(VueCookies);
new Vue({
	router,
	store,
	render: (h) => h(App),
}).$mount("#app");
