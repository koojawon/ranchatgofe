import axiosInst from "./AxiosConfig";
import store from "@/store/index";

export async function refreshToken() {
	await axiosInst
		.post("/api/refresh", null, {
			withCredentials: true,
		})
		.then((response) => {
			store.commit("setAccessToken", response.headers["authorization"]);
		})
		.catch((e) => {
			return e;
		});
}
