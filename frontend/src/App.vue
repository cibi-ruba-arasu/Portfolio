<template>
  <div id="app">
    <header class="app-header">
      <h1>Image Gallery App</h1>
    </header>
    
    <main class="app-main">
      <UserUpload 
        v-if="currentPage === 'upload'" 
        @navigate-to-gallery="switchToGallery" 
      />
      <UserGallery 
        v-else 
        @navigate-to-upload="switchToUpload" 
      />
    </main>
  </div>
</template>

<script>
import UserUpload from './components/UserUpload.vue'
import UserGallery from './components/UserGallery.vue'

export default {
  name: 'App',
  components: {
    UserUpload,
    UserGallery
  },
  data() {
    return {
      currentPage: 'upload'
    }
  },
  methods: {
    switchToUpload() {
      this.currentPage = 'upload';
    },
    switchToGallery() {
      this.currentPage = 'gallery';
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  text-align: center;
}

.app-header h1 {
  font-size: 2rem;
  font-weight: 600;
}

.app-main {
  min-height: calc(100vh - 120px);
  padding: 2rem 1rem;
}
</style>