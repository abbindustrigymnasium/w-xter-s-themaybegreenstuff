<template>
  <div>
    <login-form />
    <signup-form />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Login from '../components/LoginForm.vue'
import Signup from '../components/SignupForm.vue'

export default defineComponent({
  name: 'LoginPage',
  components: {
    'login-form': Login,
    'signup-form': Signup
  }
})
</script>