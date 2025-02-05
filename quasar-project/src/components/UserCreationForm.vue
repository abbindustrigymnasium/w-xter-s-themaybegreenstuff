<template>
    <q-page class="q-pa-md">
      <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
        <q-input
          filled
          v-model="username"
          label="Username"
          :rules="[val => val && val.length > 0 || 'Username is required']"
        />
        <q-input
          filled
          v-model="email"
          label="Email"
          type="email"
          :rules="[val => val && val.includes('@') || 'Valid email is required']"
        />
        <q-input
          filled
          v-model="password"
          label="Password"
          type="password"
          :rules="[val => val && val.length >= 6 || 'Password must be at least 6 characters']"
        />
        <q-input
          filled
          v-model="authlevel"
          label="Auth Level"
          type="number"
          :rules="[val => val && val >= 0 || 'Auth Level must be a positive number']"
        />
        <div class="q-mt-md">
          <q-btn
            label="Create User"
            color="primary"
            type="submit"
            class="full-width"
          />
        </div>
      </q-form>
  
      <q-banner v-if="errorMessage" class="q-mt-md" color="negative">
        <q-icon name="warning" size="lg" />
        <span>{{ errorMessage }}</span>
      </q-banner>
    </q-page>
  </template>
  
  <script>
  import { defineComponent, ref } from 'vue';
  
  export default defineComponent({
    name: 'UserCreationForm',
    setup() {
      const username = ref('');
      const email = ref('');
      const password = ref('');
      const authlevel = ref(0);
      const errorMessage = ref('');
  
      const handleSubmit = async () => {
        if (!confirm('Are you sure you want to create this user?')) return;
        try {
          const hostIP = window.location.hostname;
          const response = await fetch(`http://${hostIP}:3001/createUser`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: username.value,
              email: email.value,
              password: password.value,
              authlevel: authlevel.value,
            }),
          });
          if (!response.ok) {
            throw new Error('Error creating user');
          }
          username.value = '';
          email.value = '';
          password.value = '';
          authlevel.value = 0;
        } catch (error) {
          errorMessage.value = error.message || 'An unexpected error occurred.';
        }
      };
  
      return {
        username,
        email,
        password,
        authlevel,
        errorMessage,
        handleSubmit,
      };
    },
  });
  </script>
  
  <style scoped>
  .q-page {
    max-width: 400px;
    margin: 0 auto;
  }
  
  .q-btn.full-width {
    width: 100%;
  }
  </style>
  