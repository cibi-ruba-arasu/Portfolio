<template>
  <div class="gallery-container">
    <h2>Image Gallery</h2>
    <p>This is where your uploaded images will appear.</p>
    
    <div class="gallery-placeholder">
      <p>📷 No images uploaded yet</p>
    </div>
    
    <button @click="goToUpload" class="nav-btn">Upload New Image</button>
  </div>
</template>

<script>
export default {
  name: 'UserGallery',
  methods: {
    goToUpload() {
      this.$emit('navigate-to-upload');
    }
  }
}
</script>

<style scoped>
.gallery-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h2 {
  text-align: center;
  margin-bottom: 1rem;
  color: #333;
}

p {
  text-align: center;
  margin-bottom: 2rem;
  color: #666;
}

.gallery-placeholder {
  background: white;
  padding: 4rem 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  text-align: center;
  margin-bottom: 2rem;
  color: #999;
}

.nav-btn {
  width: 100%;
  background: #667eea;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.nav-btn:hover {
  background: #5a6fd8;
}
</style>