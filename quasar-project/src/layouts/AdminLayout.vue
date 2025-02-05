<template>
    <q-layout view="hHh lpR fFf">
      <!-- Header -->
      <q-header elevated class="bg-secondary text-white">
        <q-toolbar>
          <q-toolbar-title>Admin Panel</q-toolbar-title>
          <q-btn flat dense round icon="logout" @click="logout" aria-label="Logout" />
        </q-toolbar>
      </q-header>
  
      <!-- Sidebar / Drawer -->
      <admin-drawer />
  
      <!-- Main Content -->
      <q-page-container>
        <router-view />
      </q-page-container>
    </q-layout>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  import AdminPanel from '../components/AdminPanel.vue';
  
  
  export default defineComponent({
    data() {
      return {
        leftDrawerOpen: true, // Ensure the drawer is open by default
      };
    },
    methods: {
      logout() {
        // Clear local jwt and redirect to userpage
        localStorage.clear();
        this.$router.push('/');
      },
    },
    components: {
      AdminDrawer: AdminPanel,
    },
  });
  </script>
  
  <style scoped>
  /* Add any additional styles here */
  </style>