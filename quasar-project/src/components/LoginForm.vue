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
            color= green
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
      try {
        // Build request payload
        const payload = {
          username: username.value,
          password: password.value,
        };

        // Make POST request
        const hostIP = window.location.hostname;
        const response = await fetch(`http://${hostIP}:3001/auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorDetails = await response.json().catch(() => ({}));
          throw new Error(
            `Authentication failed. Status: ${response.status}. ${errorDetails.message || ''}`
          );
        }

        // Parse the JSON response
        const { token } = await response.json();
        if (!token) {
          throw new Error('Authentication succeeded but no token received.');
        }

        // Store the token
        localStorage.setItem('jwtToken', token);

        // Redirect to another page
        router.push('/user/adminpage');
      } catch (error) {
        console.error('Login error:', error);
        // Handle the error (e.g., show a notification or error message to the user)
        alert(`Login failed: ${error}`);
      }
    };


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
  margin: 100px;
}

h1 {
  text-align: center;
  color: var(--q-dark);
  margin-bottom: 2rem;
  font-weight: bold;
}

form {
  display: flex;
  flex-direction: column;
}
</style>
