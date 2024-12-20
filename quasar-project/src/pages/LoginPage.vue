<template>
  <div>
    <login-form />
    <signup-form />
    <admin-options />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Login from '../components/LoginForm.vue'
import Signup from '../components/SignupForm.vue'
import Admin from '../components/AdminPanel.vue'

export default defineComponent({
  name: 'LoginPage',
  components: {
    'login-form': Login,
    'signup-form': Signup,
    'admin-options': Admin,
  }
})
</script>