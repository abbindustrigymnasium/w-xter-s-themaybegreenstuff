<template>
  <div>
    <q-img
      src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages.pexels.com%2Fphotos%2F572688%2Fpexels-photo-572688.jpeg%3Fcs%3Dsrgb%26dl%3Dnature-forest-trees-572688.jpg%26fm%3Djpg&f=1&nofb=1&ipt=87add05bfdc8d5a0db7ea15ae1b11b6ee951308d667b26d4c686375e11fa60cd&ipo=images"
      class="q-mb-md"
      style="height: 100vh;"
    />

    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); min-width: 400px; min-height: 500px;">
      <login-form />  
    </div>
    
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Login from '../components/LoginForm.vue'

export default defineComponent({
  name: 'LoginPage',
  components: {
    'login-form': Login,
  },
  mounted() {
    document.body.style.overflow = 'hidden'; // dissable scrolling
  }
})
</script>
