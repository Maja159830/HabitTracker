<template>
  <div id="app">
    <Navbar v-if="$store.getters.isAuthenticated" />
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'

export default {
  name: 'App',
  components: {
    Navbar
  }
}
</script>

<style>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
</style>