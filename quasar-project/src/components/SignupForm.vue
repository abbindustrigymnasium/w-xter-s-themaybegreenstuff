<template>
  <q-page class="custom-page flex justify-center">
    <q-card class="signup-card">
      <q-card-section>
        <h1 class="text-h4">Sign Up</h1>
        <q-form @submit.prevent="signup" class="q-gutter-sm">
          <q-input
            filled
            v-model="username"
            label="Username"
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
            label="Create User"
            color="primary"
            class="full-width q-mt-md"
            size="md"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'SignupForm',
  setup() {
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.value,
            email: email.value,
            password: password.value
          })
        })

        if (!response.ok) {
          throw new Error('Signup failed')
        }

        console.log('Signup successful')
      } catch (error) {
        console.error('Signup error:', error)
      }
    }

    return { username, email, password, confirmPassword, signup }
  }
})
</script>

<style scoped>
/* Adjust the page padding to remove bottom padding */
.custom-page {
  padding: 16px 16px 0 16px; /* top/right/bottom/left – no bottom padding */
}

/* Style for the card */
.signup-card {
  width: 100%;
  max-width: 400px;
  padding: 10px; /* Adjust internal card padding */
  max-height: 85vh;
  overflow-y: auto;
}

/* Center the title */
h1 {
  text-align: center;
  color: #000;
  margin-bottom: 1rem;
}

/* Remove the extra bottom spacing in q-input fields */
.q-field__bottom {
  margin: 0 !important;
  padding: 0 !important;
}

/* Optionally, if you want to remove default form margins */
form {
  display: flex;
  flex-direction: column;
}
</style>
