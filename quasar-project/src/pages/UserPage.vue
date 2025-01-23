<template>
    <body>
        <div>
            <h1>The maybe green stuff</h1>
        </div>

        <span class="row">
            <div class="infobox">
                <div class="info"></div>
            </div>
            
            <div class="picturebox">
                <div id="pic1"> </div>
                <div id="pic2"> </div>
                <div id="pic3"> </div>        
            </div>
        </span>
    </body>
  </template>


<script lang='ts'>


export default {
    name: 'UserPage',
    data() {
        return {
            
        };
    },
    methods: {
       
        // Add your methods here
    },
    computed: {
        // Add your computed properties here
    }
};
</script>



<style scoped>
body {
    background-image: url("../assets/overgrown-wall.jpg");
    max-width: 100%;
    height:617px;
    background-repeat: no-repeat;
    background-size: cover;
    display: flex;
    justify-content: center;
    flex-direction: column;
}

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
}

.row {
    flex-direction: row;
}

.infobox {
    background-color: white;
    width: 350px;
    height: 400px;
    margin: 10px 50px;
    border: 10px;
    border-radius: 20px;
}

#pic1 {
    background-color: white;
    width: 150px;
    height: 150px;
    border: 10px;
    border-radius: 100px;
}

#pic2 {
    background-color: white;
    width: 200px;
    height: 300px;
    margin: 60px 50px 50px;
    border: 10px;
    border-radius: 20px;
}

#pic3 {
    background-color: white;
    width: 150px;
    height: 150px;
    border: 10px;
    border-radius: 100px;
}
</style>