<template>
    <div class="q-pa-xl flex flex-center">
      <q-card class="signup-card">
        <q-card-section>
          <h1 class="text-h4">Sign Up</h1>
          <form @submit.prevent="signup">
            <q-input
              filled
              v-model="username"
              label="Username"
              class="q-mb-md"
              :rules="[val => !!val || 'Field is required']"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <q-input
              filled
              v-model="email"
              label="Email"
              type="email"
              class="q-mb-md"
              :rules="[
                val => !!val || 'Field is required',
                val => /^[^@]+@[^@]+\.[^@]+$/.test(val) || 'Invalid email'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="mail" />
              </template>
            </q-input>
            
            <q-input
              filled
              v-model="password"
              label="Password"
              type="password"
              class="q-mb-md"
              :rules="[
                val => !!val || 'Field is required',
                val => val.length >= 8 || 'Password must be at least 8 characters'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
            </q-input>

            <q-input
              filled
              v-model="confirmPassword"
              label="Confirm Password"
              type="password"
              class="q-mb-lg"
              :rules="[
                val => !!val || 'Field is required',
                val => val === password || 'Passwords do not match'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
            </q-input>
            
            <q-btn
              type="submit"
              label="Sign Up"
              color="primary"
              class="full-width"
              size="large"
            />
          </form>
        </q-card-section>
      </q-card>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue'
  //import { useRouter } from 'vue-router'
  
  export default defineComponent({
    name: 'SignupPage',
    setup() {
      //const router = useRouter()
      const username = ref('')
      const email = ref('')
      const password = ref('')
      const confirmPassword = ref('')
  
      const signup = async () => {
        if (password.value !== confirmPassword.value) {
          console.error('Passwords do not match')
          return
        }

        try {
          const response = await fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: username.value,
              email: email.value,
              password: password.value
            })
          });
  
          if (!response.ok) {
            throw new Error('Signup failed');
          }
  
          //router.push('/login');
        } catch (error) {
          console.error('Signup error:', error);
          // Handle error (show notification, etc)
        }
      }
  
      return {
        username,
        email,
        password,
        confirmPassword,
        signup
      }
    }
  })
  </script>
  
  <style scoped>
  .signup-card {
    width: 100%;
    max-width: 400px;
    padding: 20px;
  }
  
  h1 {
    text-align: center;
    color: #1976D2;
    margin-bottom: 2rem;
  }
  
  form {
    display: flex;
    flex-direction: column;
  }
  </style>