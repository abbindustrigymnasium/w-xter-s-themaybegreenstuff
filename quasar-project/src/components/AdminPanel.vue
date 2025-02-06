<template>    
<!-- Sidebar / Drawer -->
    <q-drawer v-model="leftDrawerOpen" show-if-above side="left" elevated permanent>
        <q-list>
        
        <q-item clickable to="/user/adminpage" active-class="text-primary">
            <q-item-section avatar>
            <q-icon name="person" />
            </q-item-section>
            <q-item-section>Admin</q-item-section>
        </q-item>
        <q-item clickable to="/user/usercreation" active-class="text-primary">
            <q-item-section avatar>
            <q-icon name="terminal" />
            </q-item-section>
            <q-item-section>User Creation</q-item-section>
        </q-item>
        </q-list>
    </q-drawer>
</template>


<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
    
    name: 'AdminPanel',
    // Drawer is always open by default
    setup() {
        const leftDrawerOpen = ref(true)
        return {
            leftDrawerOpen
        }
    }
})

</script>