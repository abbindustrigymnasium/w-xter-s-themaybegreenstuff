<template>
  <router-view />
</template>

<script setup>
import { watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

watch(route, (to) => {
  document.title = to.meta.title || 'Default Title';
}, { immediate: true });
</script>