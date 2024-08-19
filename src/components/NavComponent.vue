<template>
    <body>
    <nav class="navbar fixed-top px-2 navBack">
        <div class="logo">
            <i class="bi bi-heart-pulse logoColor"></i>
            <span class="navbar-brand h1 mx-2">랜챗고</span>
        </div>
        <button @click="buttonAction" class="btn btn-outline-success mx-2">
            <i class="bi bi-power"></i>
            {{ loginState }}
        </button>
    </nav>
    </body>
</template>

<script>
import axiosInst from '@/service/AxiosConfig';

export default {
    name: "NavComponent",
    computed: {
        loginState() {
            if (this.$store.getters.getAccessToken !== "") {
                return "로그아웃";
            }
            return "로그인";
        }
    },
    methods: {
        buttonAction() {
            if (this.$store.getters.getAccessToken === "") {
                this.$router.push("/login");
                return;
            }
            axiosInst.post("/api/logout", null, {
                withCredentials: true
            }).then(() => {
                this.$store.commit("setAccessToken", "");
            });
        }
    }
    
}
</script>

<style scoped>

.navBack {
    background-color: orange;
}

.logoColor {
    color: red;
}

</style>