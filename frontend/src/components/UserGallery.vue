<template>
  <div class="gallery-container">
    <div class="header-actions">
      <h2>Image Gallery</h2>
      <button @click="goToUpload" class="nav-btn">Upload New Image</button>
    </div>

    <div v-if="loading" class="loading">Loading images...</div>
    
    <div v-else-if="images.length === 0" class="empty-state">
      <p>No images uploaded yet.</p>
      <p>Click "Upload New Image" to get started!</p>
    </div>

    <div v-else class="images-grid">
      <div 
        v-for="image in images" 
        :key="image._id" 
        class="image-card"
      >
        <div class="image-container">
          <img 
            :src="image.imageUrl" 
            :alt="image.title" 
            class="image"
            @error="handleImageError(image)"
            @load="handleImageLoad(image)"
          >
          <div v-if="image.loading" class="image-loading">Loading...</div>
          <div v-if="image.error" class="image-error">Failed to load image</div>
        </div>
        
        <div class="image-info">
          <h3 class="image-title">{{ image.title }}</h3>
          <p class="image-description">{{ image.description }}</p>
          <p class="image-date">{{ formatDate(image.createdAt) }}</p>
          <p class="image-url">URL: {{ image.imageUrl }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserGallery',
  data() {
    return {
      images: [],
      loading: false
    }
  },
  methods: {
    async fetchImages() {
      this.loading = true;
      try {
        const response = await fetch('http://localhost:5000/api/images');
        if (response.ok) {
          const imagesData = await response.json();
          // Add loading and error states to each image
          this.images = imagesData.map(img => ({
            ...img,
            loading: true,
            error: false
          }));
          console.log('Images loaded:', this.images);
        } else {
          console.error('Failed to fetch images:', response.status);
          alert('Failed to load images');
        }
      } catch (error) {
        console.error('Error fetching images:', error);
        alert('Network error: ' + error.message);
      } finally {
        this.loading = false;
      }
    },
    handleImageError(image) {
      console.error('Image failed to load:', image.imageUrl);
      image.error = true;
      image.loading = false;
    },
    handleImageLoad(image) {
      console.log('Image loaded successfully:', image.imageUrl);
      image.loading = false;
      image.error = false;
    },
    goToUpload() {
      this.$emit('navigate-to-upload');
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  },
  mounted() {
    this.fetchImages();
  }
}
</script>

<style scoped>
/* ... keep your existing styles ... */

.image-loading, .image-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.image-error {
  background: rgba(220, 53, 69, 0.8);
}

.image-url {
  font-size: 0.8rem;
  color: #666;
  word-break: break-all;
  margin-top: 0.5rem;
}
</style>