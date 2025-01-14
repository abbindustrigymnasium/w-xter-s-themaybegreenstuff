<template>
  <q-layout view="hHh lpR fFf">
    <!-- Header -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>Main Layout</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- Drawer -->
    <q-drawer show-if-above side="left" elevated>
      <q-list>
        <q-item clickable to="/dashboard">
          <q-item-section>Dashboard</q-item-section>
        </q-item>
        <q-item clickable to="/userpage">
          <q-item-section>User Page</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Main Content -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'MainLayout'
};
</script>