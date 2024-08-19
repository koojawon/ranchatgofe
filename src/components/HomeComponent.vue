<template>
  <div
    class="d-flex flex-column justify-content-center align-items-center mainContainer"
  >
    <div>안녕하세요! 바로 시작해 볼까요?</div>
    <div>
      <button class="btn btn-warning" @click="gotoChat">채팅하러 가기</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "HomeComponent",
  methods: {
    gotoChat() {
      this.$router.push("/chat");
    },
  },
};
</script>

<style scoped>
.mainContainer {
  height: 100vh;
}
</style>