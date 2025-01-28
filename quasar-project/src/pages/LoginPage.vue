<template>
  <div class="background">
    <login-form />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Login from '../components/LoginForm.vue'

export default defineComponent({
  name: 'LoginPage',
  components: {
    'login-form': Login,
  },
  mounted() {
    document.body.style.overflow = 'hidden'; // dissable scrolling
  }
})
</script>



<style scoped>
.background {
background-image: url(../assets/greenery-background.jpg);
  background-size: cover;
  
  
}


</style>
