<template>
    <div class="admin-page">
      <!-- Flex container for header and idk box -->
      <div class="header-row">
        <h1 ref="header">Admin Page</h1>
        <div class="idk" ref="idk"></div>
      </div>
      <span class="row">
        <GraphGeneric />
      </span>
  
      <!-- Controller row: only GreenHouseController is rendered -->
      <div class="controller-row">
        <div class="controller-item greenhouse-controller">
          <GreenHouseController />
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, onMounted, ref, nextTick, onBeforeUnmount } from 'vue';
  import GreenHouseController from '../components/GreenHouseController.vue';
  import GraphGeneric from '../components/GraphGeneric.vue';
  
  export default defineComponent({
    name: 'AdminPage',
    components: {
      GraphGeneric,
      GreenHouseController,
      // UserCreationForm removed
    },
    setup() {
      // Create references to the header and idk elements
      const header = ref<HTMLElement | null>(null);
      const idk = ref<HTMLElement | null>(null);
  
      // Function to update the .idk element's width and height based on the header's height
      const updateIdkSize = () => {
        if (header.value && idk.value) {
          const headerHeight = header.value.offsetHeight;
          idk.value.style.width = `${headerHeight}px`;
          idk.value.style.height = `${headerHeight}px`;
        }
      };
  
      // Set up the size on mount and update it on window resize
      onMounted(() => {
        nextTick(() => {
          updateIdkSize();
          window.addEventListener('resize', updateIdkSize);
        });
      });
  
      onBeforeUnmount(() => {
        window.removeEventListener('resize', updateIdkSize);
      });
  
      return { header, idk };
    },
  });
  </script>
  
  <style scoped>
  /* Main container */
  .admin-page {
    background-image: url("../assets/greenhouse-background.jpg");
    max-width: 100%;
    background-repeat: no-repeat;
    background-size: cover;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    overflow-y: auto;
    padding: 20px;
  }
  
  /* Flex container for header and idk box */
  .header-row {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    gap: 20px;
  }
  
  /* Header styling */
  h1 {
    color: rgb(77, 39, 11);
    background-color: white;
    padding: 10px 25px;
    border: 10px solid white;
    border-radius: 20px;
    font-size: 3em;
    font-family: "Times New Roman", Times, serif;
    font-weight: bold;
    text-align: left;
    display: inline-block;
    margin: 20px 0;
  }
  
  /* The idk box; its width and height will be set dynamically */
  .idk {
    background-image: url("../assets/dark-greenery.jpeg");
    background-repeat: no-repeat;
    background-size: cover;
    border: 7px solid white;
    border-radius: 200px;
    margin: 20px 0;
  }
  
  /* Graph row styling */
  .row {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: center;
    margin-bottom: 20px;
  }
  
  /* Controller row styling */
  .controller-row {
    position: relative;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    width: 100%;
    gap: 20px;
    margin-top: 20px;
    background-color: #ffffff;
    border-radius: 10px;
  }
  
  /* Base styling for each controller container */
  .controller-item {
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  /* Specific styling for the GreenHouseController */
  .greenhouse-controller {
    flex: 1; /* Allow it to take the available space */
    background-image: url("../assets/greenhouse-controller-bg.jpg"); /* Replace with your image path */
    background-size: cover;
    background-position: center;
  }
  </style>
  