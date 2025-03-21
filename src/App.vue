<script setup>
import Sidebar from './components/Sidebar.vue';
</script>

<template>
  <div class="flex min-h-screen">
    <Sidebar />
    <main class="flex-1">
      <router-view />
    </main>
  </div>
</template>
