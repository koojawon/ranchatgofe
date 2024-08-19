<template>
  <div class="home">
    <NavComponent/>
    <HomeComponent/>
  </div>
</template>

<script>
// @ is an alias to /src
import HomeComponent from '@/components/HomeComponent.vue'
import NavComponent from '@/components/NavComponent.vue';

export default {
  name: 'HomeView',
  components: {
    HomeComponent,NavComponent
  }
}
</script>
