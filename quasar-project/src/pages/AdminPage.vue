<template>
    <body>
    <div>
        <h1>Admin Page</h1>
        <span class="row">
            
                <GraphGeneric />
          
            
           
                <!-- <div class="idk"></div> -->
            
        </span>
        <GreenHouseController />
        <UserCreationForm />
    </div>
    </body> 
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
};
</script>



<style scoped>
h1 { 
    color: rgb(77, 39, 11);
    background-color: white;
    margin: 20px 50px 10px 50px;
    padding: 10px 25px;
    border: 10px;
    border-radius: 20px;
    border-color: white;
    border-style: solid;
    font-size: 6em;
    font-family: "Times New Roman", Times, serif;
    font-weight: bold; 
    font-stretch: expanded;
    text-align: center;
}

body {
    background-image: url("../assets/greenhouse-background.jpg");
    max-width: 100%;
    background-repeat: no-repeat;
    background-size: cover;
    display: flex;
    justify-content: center;
    flex-direction: column;
}

.row {
    flex-direction: row;
}

.idk {
    background-image: url("../assets/dark-greenery.jpeg");
    max-width: 100%;
    background-repeat: no-repeat;
    background-size: cover;
    border: 7px solid white;
    width: 250px;
    height: 250px;
    border-radius: 200px;
    margin: 50px 70px;

}


</style>