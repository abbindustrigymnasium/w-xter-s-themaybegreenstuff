<template>
    <div class="user-page">
      <!-- Semantic header container -->
      <header class="page-header">
        <h1>The <span class="maybe-oblique">Maybe</span> Green Stuff</h1>
      </header>
  
      <div class="row">
        <div class="infobox">
          <div class="info">
            <p><strong>Välkommen till vårt växthusprojekt!</strong></p>
            <p>
              Detta är en interaktiv hemsida där vi styr vårt smarta växthus. Genom att använda knapparna kan vi:
            </p>
            <ul>
              <li>Öppna och stänga luckan för att reglera temperaturen.</li>
              <li>Vattna växterna vid behov.</li>
              <li>Starta fläkten för att öka luftcirkulationen.</li>
            </ul>
            <p>
              Projektet kombinerar programmering och teknik för att skapa ett automatiserat och effektivt växthus!
            </p>
          </div>
        </div>
        
        <div class="picturebox">
          <div id="pic1"></div>
          <div id="pic2"></div>
          <div id="pic3"></div>        
        </div>
      </div>
  
      <!-- Render the GraphGeneric component -->
      <GraphGeneric />
    </div>
  </template>
  
  <script lang="ts">
  import GraphGeneric from '../components/GraphGeneric.vue';
  
  export default {
    name: 'UserPage',
    components: {
      GraphGeneric,
    },
    data() {
      return {
        // Your data properties (if any)
      };
    },
    methods: {
      // Your methods
    },
    computed: {
      // Your computed properties
    }
  };
  </script>
  
  <style scoped>
  /* Main container styling replacing the <body> tag */
  .user-page {
    background-image: url("../assets/rightfuck.jpg");
    max-width: 100%;
    height: 617px;
    background-repeat: no-repeat;
    background-size: cover;
    display: flex;
    flex-direction: column;
    text-align: center;
  }
  
  /* Optional header container styling */
  .page-header {
    margin: 20px;
  }
  
  /* Header (h1) styling */
  h1 { 
    color: rgb(77, 39, 11);
    background-color: white;
    margin: 20px 50px 10px 50px;
    padding: 10px 25px;
    border: 10px solid white;
    border-radius: 20px;
    font-size: 6em;
    font-family: "Times New Roman", Times, serif;
    font-weight: bold; 
    font-stretch: expanded;
  }
  
  /* Make "Maybe" oblique */
  .maybe-oblique {
    font-style: oblique;
  }
  
  /* Row layout for infobox and picturebox */
  .row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
  
  /* Infobox styling */
  .infobox {
    background-color: white;
    width: 350px;
    margin: 10px 50px;
    border: 10px solid white;
    border-radius: 20px;
    padding: 15px;
    /* Removed fixed height so the box expands to fit the content */
  }
  
  /* Picture container styling */
  .picturebox {
    display: flex;
    flex-direction: column;
    position: relative;
    gap: 10px;
  }
  
  /* First picture styling */
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
  
  /* Second picture styling */
  #pic2 {
    background-image: url("../assets/gröngrid.jpg");
    background-size: cover;
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
  
  /* Third picture styling */
  #pic3 {
    background-image: url("../assets/vattenkanna.png");
    background-size: contain;
    background-color: white;
    width: 150px;
    height: 150px;
    border: 5px solid white;
    border-radius: 100px;
    position: absolute; 
    left: 80px;
    bottom: 20px;
    z-index: 2;
  }
  </style>