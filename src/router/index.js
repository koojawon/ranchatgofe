import Vue from "vue";
import VueRouter from "vue-router";
import HomeView from "../views/HomeView.vue";
import store from "@/store/index";
import { refreshToken } from "@/service/token";

Vue.use(VueRouter);

const routes = [
	{
		path: "/",
		name: "home",
		component: HomeView,
		meta: {
			unauthorized: true,
		},
	},
	{
		path: "/chat",
		name: "chat",
		component: () => import("../views/ChatView.vue"),
		meta: {
			unauthorized: true,
		},
	},
	{
		path: "/login",
		name: "login",
		component: () => import("../views/LoginView.vue"),
		meta: {
			unauthorized: true,
		},
	},
];

const router = new VueRouter({
	routes,
	mode: "history",
});

router.beforeEach(async (to, from, next) => {
	if (Vue.$cookies.get("refresh_token") !== null) {
		await refreshToken();
	}
	if (
		to.matched.some((record) => record.meta.unauthorized) ||
		store.getters.getAccessToken
	)
		return next();

	alert("로그인이 필요합니다!");
	return next("/login");
});

export default router;
