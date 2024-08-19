<template>
    <!-- <img alt="Vue logo" src="../assets/logo.png"> -->
    <LoginComponent/>
</template>

<script>
// @ is an alias to /src
import LoginComponent from '@/components/LoginComponent.vue'

export default {
  name: 'LoginView',
  components: {
    LoginComponent,
  }
}
</script>
