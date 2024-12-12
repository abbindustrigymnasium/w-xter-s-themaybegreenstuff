<template>
  <div id="app">
    <D3LineChart :data="chartData" />
  </div>
</template>

<script>
import D3LineChart from "./components/D3LineChart.vue";

export default {
  name: "App",
  components: {
    D3LineChart,
  },
  data() {
    return {
      chartData: [
        { date: new Date("2023-01-01"), temperature: 32 },
        { date: new Date("2023-01-02"), temperature: 35 },
        { date: new Date("2023-01-03"), temperature: 28 },
        { date: new Date("2023-01-04"), temperature: 30 },
      ],
    };
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
