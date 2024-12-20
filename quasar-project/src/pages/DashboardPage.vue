<template>
    <div>
        <q-page class="flex flex-center">
        <q-card class="q-mx-md" style="max-width: 400px">
            <q-card-section>
            <q-item>
                <q-item-section>
                <q-item-label header>
                    Admin Options
                </q-item-label>
                </q-item-section>
            </q-item>
            </q-card-section>
            <q-card-section>
            <q-item>
                <q-item-section>
                <q-item-label>
                    <q-icon name="person" />
                    Users
                </q-item-label>
                </q-item-section>
                <q-item-section side>
                <q-btn
                    color="primary"
                    unelevated
                    to="/admin/users"
                    label="Manage"
                />
                </q-item-section>
            </q-item>
            <q-item>
                <q-item-section>
                <q-item-label>
                    <q-icon name="settings" />
                    Settings
                </q-item-label>
                </q-item-section>
                <q-item-section side>
                <q-btn
                    color="primary"
                    unelevated
                    to="/admin/settings"
                    label="Manage"
                />
                </q-item-section>
            </q-item>
            </q-card-section>
        </q-card>
        </q-page>
    </div>
</template>

<script setup lang="ts">
//import { ref } from 'vue'



</script>