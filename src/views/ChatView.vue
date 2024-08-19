<template>
  <div>
    <NavComponent/>
    <ChatComponent/>  
  </div>
</template>

<script>
import ChatComponent from '@/components/ChatComponent.vue';
import NavComponent from '@/components/NavComponent.vue';

export default {
  components: { ChatComponent,NavComponent }
}
</script>

<style scoped>

</style>