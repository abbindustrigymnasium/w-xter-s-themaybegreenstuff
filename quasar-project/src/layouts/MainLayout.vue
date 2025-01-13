<template>
  <q-layout view="hHh lpR fFf">
    <!-- Header -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title id="header_text">Wäxterås</q-toolbar-title>
      </q-toolbar>
    </q-header>


    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
</script>


<style>
#header_text {
  font-size: 3em;
  margin-left: 150px;
  font-family: "Times New Roman", Times, serif;
  font-weight: bold; 
  font-stretch: expanded;
}

</style>