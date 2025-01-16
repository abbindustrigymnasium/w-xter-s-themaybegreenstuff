<template>
    <div>
        <h1>Admin Page</h1>
        <Graph />
    </div>
  </template>

<script lang='ts'>
    //import { defineComponent } from 'vue';
    import Graph from '../components/GraphGeneric.vue';

export default {
    name: 'AdminPage',
    data() {
        return {
            
        };
    },
    methods: {
       
        // Add your methods here
    },
    computed: {
        // Add your computed properties here
    },
    components: {
        Graph: Graph
    }
};
</script>



<style scoped>

</style>