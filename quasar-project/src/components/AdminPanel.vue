<template>    
<!-- Sidebar / Drawer -->
    <q-drawer v-model="leftDrawerOpen" show-if-above side="left" elevated permanent>
        <q-list>
        <q-item clickable to="/user/terminal" active-class="text-primary">
            <q-item-section avatar>
            <q-icon name="terminal" />
            </q-item-section>
            <q-item-section>Dashboard</q-item-section>
        </q-item>
        <q-item clickable to="/user/profile" active-class="text-primary">
            <q-item-section avatar>
            <q-icon name="person" />
            </q-item-section>
            <q-item-section>Profile</q-item-section>
        </q-item>
        <q-item clickable to="/user/settings" active-class="text-primary">
            <q-item-section avatar>
            <q-icon name="settings" />
            </q-item-section>
            <q-item-section>Settings</q-item-section>
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