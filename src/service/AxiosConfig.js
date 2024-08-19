import axios from "axios";
import store from "@/store/index.js";
import { refreshToken } from "./token";
const axiosInst = axios.create({
	baseURL: "http://localhost:8082/",
});

axiosInst.interceptors.request.use(
	async function (config) {
		config.headers["authorization"] = "Bearer " + store.getters.getAccessToken;
		return config;
	},
	function (error) {
		return Promise.reject(error);
	}
);

axiosInst.interceptors.response.use(
	function (response) {
		return response;
	},
	async function (error) {
		const errorAPI = error.config;
		if (error.response.data.status === 401 && errorAPI.retry === undefined) {
			errorAPI.retry = true;
			await refreshToken();
			return await axiosInst(errorAPI);
		}
		return Promise.reject(error);
	}
);

export default axiosInst;
