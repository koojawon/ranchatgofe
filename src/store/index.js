import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		memberInfo: {
			nickname: "",
			email: "",
		},
		jwtTokens: {
			access: "",
		},
	},
	getters: {
		getNickname(state) {
			return state.memberInfo.nickname;
		},
		getAccessToken(state) {
			return state.jwtTokens.access;
		},
	},
	mutations: {
		setMemberInfo(state, payload) {
			state.memberInfo.nickname = payload.nickname;
			state.memberInfo.email = payload.userId;
		},
		setAccessToken(state, payload) {
			state.jwtTokens.access = payload;
		},
	},
	actions: {},
	modules: {},
});

export default store;
