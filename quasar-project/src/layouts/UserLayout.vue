<template>
    <q-layout view="hHh lpR fFf">
      <!-- Header -->
      <q-header elevated class="bg-primary text-white">
        <q-toolbar>
          <q-toolbar-title>User Panel</q-toolbar-title>
          <q-btn flat dense round icon="logout" @click="logout" aria-label="Logout" />
        </q-toolbar>
      </q-header>
  
      <!-- Sidebar / Drawer -->
      <UserDrawer />
  
      <!-- Main Content -->
      <q-page-container>
        <router-view />
      </q-page-container>
    </q-layout>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  import UserDrawer from '../components/UserDrawer.vue';
  
  export default defineComponent({
    data() {
      return {
        leftDrawerOpen: true, // Ensure the drawer is open by default
      };
    },
    methods: {
      logout() {
        // Implement your logout logic here
      },
    },
    components: {
      UserDrawer: UserDrawer,
    },
  });
  </script>
  
  <style scoped>
  /* Add any additional styles here */
  </style>