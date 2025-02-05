<template>
    <body>
        <div>
            <h1>The maybe green stuff</h1>
        </div>

        <div class="row">
            <div class="infobox">
                <div class="info"></div>
            </div>
            
            <div class="picturebox">
                <div id="pic1">  </div>
                <div id="pic2">  </div>
                <div id="pic3">  </div>        
            </div>
        </div>
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
    background-image: url("../assets/rightfuck.jpg");
    max-width: 100%;
    height:617px;
    background-repeat: no-repeat;
    background-size: cover;
    display: flex;
    justify-content: center;
    flex-direction: column;
    text-align: center;
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
    display: flex;
    flex-direction: row;
    align-items: center;
}

.infobox {
    background-color: white;
    width: 350px;
    height: 400px;
    margin: 10px 50px;
    border: 10px;
    border-radius: 20px;
}

.picturebox {
    display: flex;
    flex-direction: column;
    position: relative;
    gap: 10px;
}

#pic1 {
    background-image: url("../assets/växthus.jpg");
    background-size: contain;
    background-color: white;
    width: 200px;
    height: 200px;
    border: 5px solid white; 
    border-radius: 100px;
    position: absolute;
    left: 30px;
    top: 10px;
    z-index: 2;
}

#pic2 {
    background-image: url("../assets/gröngrid.jpg");
    background-size:cover;
    background-repeat: no-repeat;
    width: 200px;
    height: 300px;
    margin: 60px 150px 50px;
    border: 5px solid white;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    z-index: 1;
}

#pic3 {
    background-image: url("../assets/vattenkanna.png");
    background-size: contain;
    background-color: white;
    width: 150px;
    height: 150px;
    border: 5px solid white;
    border-radius: 100px;
    position: absolute; 
    bottom: 0px;
    left: 80px;
    bottom: 20px;
    z-index: 2;
}
</style>