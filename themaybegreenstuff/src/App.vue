<template>
  <div id="app">
    <header>
      <h1>Login To Observe The Green Stuff</h1>
    </header>
    <main>
      <!-- Using the LoginPage component -->
      <LoginPage />
    </main>
  </div>
</template>

<script>
import LoginPage from "./components/LoginPage.vue";

export default {
  name: "App",
  components: {
    LoginPage, // Register the LoginPage component
  },
};
</script>

<style>
/* Basic App styles */
#app {
  font-family: Arial, sans-serif;
  text-align: center;
  color: #333;
  margin-top: 50px;
}
header {
  margin-bottom: 20px;
}
main {
  display: flex;
  justify-content: center;
}
</style>
