<template>
  <div>
    
    <h1>The login page is now depricated and replaced by cleaner solution</h1>
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
  }
})
</script>