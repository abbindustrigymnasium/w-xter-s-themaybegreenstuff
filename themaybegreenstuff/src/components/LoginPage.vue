<template>
    <div class="login-container">
      <h1>Login</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Enter your username"
          />
          <span v-if="errors.username">{{ errors.username }}</span>
        </div>
  
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
          />
          <span v-if="errors.password">{{ errors.password }}</span>
        </div>
  
        <button type="submit">Login</button>
        <div v-if="loginError" class="error">{{ loginError }}</div>
      </form>
    </div>
  </template>
  
  <script lang="ts">
  import { ref } from "vue";
  
  export default {
    name: "LoginPage",
    setup() {
      const username = ref("");
      const password = ref("");
      const errors = ref<{ username?: string; password?: string }>({});
      const loginError = ref("");
  
      const validateForm = () => {
        errors.value = {};
        if (!username.value) {
          errors.value.username = "Username is required.";
        }
        if (!password.value) {
          errors.value.password = "Password is required.";
        }
        return Object.keys(errors.value).length === 0;
      };
  
      const handleLogin = async () => {
        if (!validateForm()) return;
  
        try {
          // Simulate a login API call
          const isAuthenticated = await fakeLoginApi(username.value, password.value);
  
          if (isAuthenticated) {
            alert("Login successful!");
          } else {
            loginError.value = "Invalid username or password.";
          }
        } catch (error) {
          loginError.value = "An error occurred. Please try again.";
        }
      };
  
      const fakeLoginApi = async (username: string, password: string) => {
        // Simulate an API call with a delay
        return new Promise<boolean>((resolve) => {
          setTimeout(() => {
            resolve(username === "admin" && password === "1234");
          }, 1000);
        });
      };
  
      return {
        username,
        password,
        errors,
        loginError,
        handleLogin,
      };
    },
  };
  </script>
  
  <style scoped>
  .login-container {
    max-width: 400px;
    margin: 50px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  .form-group {
    margin-bottom: 20px;
  }
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  .form-group input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  .form-group span {
    color: red;
    font-size: 0.9rem;
  }
  button {
    display: block;
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  button:hover {
    background-color: #0056b3;
  }
  .error {
    color: red;
    margin-top: 10px;
    font-size: 0.9rem;
  }
  </style>
  