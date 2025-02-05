<template>
    <div>
        <h1>Admin Page</h1>
        <GraphGeneric :data="chartData" />
        <GreenHouseController />
        <UserCreationForm />
    </div>
  </template>

<script lang='ts'>
import GreenHouseController from '../components/GreenHouseController.vue';
import GraphGeneric from '../components/GraphGeneric.vue';
import UserCreationForm from '../components/UserCreationForm.vue';

export default {
    name: 'AdminPage',
    methods: {
       
        // Add your methods here
    },
    computed: {
        // Add your computed properties here
    },
    components: { GraphGeneric, GreenHouseController : GreenHouseController, UserCreationForm : UserCreationForm },
    data() {
        return {
        chartData: [
            { date: new Date(2021, 0, 1), temperature: 70 },
            { date: new Date(2021, 0, 2), temperature: 69 },
            { date: new Date(2021, 0, 3), temperature: 68 },
            { date: new Date(2021, 0, 4), temperature: 69 },
            { date: new Date(2021, 0, 5), temperature: 67 },
            { date: new Date(2021, 0, 6), temperature: 66 },
            { date: new Date(2021, 0, 7), temperature: 65 },
            { date: new Date(2021, 0, 8), temperature: 64 },
            { date: new Date(2021, 0, 9), temperature: 63 },
            { date: new Date(2021, 0, 10), temperature: 62 },
        ]};
    },
};
</script>



<style scoped>

</style>