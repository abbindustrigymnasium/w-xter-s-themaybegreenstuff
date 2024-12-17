<template>
  <div class="q-pa-md">
    <div class="q-gutter-y-md column" style="max-width: 300px">

      <form @submit.prevent="login">
        <h1>Login</h1>
        <q-input filled v-model="username" label="Username or Email" />
        <q-input filled v-model="password" label="Password" type="password" />
        <q-btn type="submit" label="Login" color="primary" />
      </form>
    </div>
  </div>
  
</template>


<script setup lang="ts">
import { ref } from 'vue'
const username = ref('')
const password = ref('')

const login = () => {
  console.log('username:', username.value)
  console.log('password:', password.value)
};

</script>

<style>

form {
  display: flex;
  flex-direction: column;
}
form h1 { 
  font-size: auto;
  text-align: center;
  font-weight: bold;
  margin-bottom: 1em;
}

</style> 