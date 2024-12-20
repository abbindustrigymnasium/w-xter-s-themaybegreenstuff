<template>
  <div class="q-pa-xl flex flex-center">
    <q-card class="login-card">
      <q-card-section>
        <h1 class="text-h4">Admin Login</h1>
        <form @submit.prevent="login">
          <q-input
            filled
            v-model="username"
            label="Username or Email"
            class="q-mb-md"
            :rules="[val => !!val || 'Field is required']"
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>
          
          <q-input
            filled
            v-model="password"
            label="Password"
            type="password"
            class="q-mb-lg"
            :rules="[val => !!val || 'Field is required']"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
          </q-input>
          
          <q-btn
            type="submit"
            label="Login"
            color="dark"
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
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    const username = ref('')
    const password = ref('')

    const login = async () => {
      // TODO: Implement login logic
      // NOTE: You should use a state management library like Vuex for this
      console.log('Login attempt:', username.value, password.value)
      try {
        const response = await fetch('http://localhost:3000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username.value,
            password: password.value
          })
        });

        if (!response.ok) {
          throw new Error('Login failed');
        }

        // Redirect to dashboard or home page
        router.push('/userpage');
      } catch (error) {
        console.error('Login error:', error);
        // Handle error (show notification, etc)
      }
    }

    return {
      username,
      password,
      login
    }
  }
})
</script>

<style scoped>
.login-card {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

h1 {
  text-align: center;
  color: var(--q-dark);
  margin-bottom: 2rem;
}

form {
  display: flex;
  flex-direction: column;
}
</style>