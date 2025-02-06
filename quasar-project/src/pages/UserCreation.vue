<template>
    <div class="container">
      <!-- The UserCreationForm component is centered -->
      <UserCreationForm />
    </div>
  </template>
  
  <script>
  import UserCreationForm from '../components/UserCreationForm.vue';
  
  export default {
    name: 'GenericPage',
    components: {
      UserCreationForm,
    },
  };
  </script>
  
  <style scoped>
  .container {
    /* Full viewport height to allow vertical centering */
    min-height: 100vh;
    
    /* Flexbox centering */
    display: flex;
    justify-content: center;
    align-items: center;
  
    /* A generic background (light gray in this example) */
    background-color: #f0f0f0;
  }
  </style>
  