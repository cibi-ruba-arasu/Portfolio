<template>
  <div class="upload-container">
    <div class="header-actions">
      <h2>Upload Image</h2>
      <button @click="goToGallery" class="nav-btn">View Gallery</button>
    </div>
    
    <form @submit.prevent="handleSubmit" class="upload-form">
      <div class="form-group">
        <label for="title">Title:</label>
        <input
          type="text"
          id="title"
          v-model="form.title"
          placeholder="Enter image title"
          class="form-input"
        >
      </div>
      
      <div class="form-group">
        <label for="description">Description:</label>
        <textarea
          id="description"
          v-model="form.description"
          placeholder="Enter image description"
          rows="4"
          class="form-textarea"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label for="image">Select Image:</label>
        <input
          type="file"
          id="image"
          @change="handleFileSelect"
          accept="image/*"
          class="form-file"
        >
        
        <!-- Image Preview -->
        <div v-if="imagePreview" class="image-preview">
          <p>Preview:</p>
          <img :src="imagePreview" alt="Selected image preview" class="preview-image">
        </div>
      </div>
      
      <button type="submit" class="submit-btn">Upload Image</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'UserUpload',
  data() {
    return {
      form: {
        title: '',
        description: '',
        image: null
      },
      imagePreview: null
    }
  },
  methods: {
    handleFileSelect(event) {
      const file = event.target.files[0];
      this.form.image = file;
      
      // Create preview
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.imagePreview = null;
      }
      
      console.log('Selected file:', file);
    },
    async handleSubmit() {
  if (!this.form.title || !this.form.description || !this.form.image) {
    alert('Please fill in all fields and select an image');
    return;
  }

  try {
    console.log('Starting upload...');
    
    const formData = new FormData();
    formData.append('title', this.form.title);
    formData.append('description', this.form.description);
    formData.append('image', this.form.image);

    const response = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData
    });

    console.log('Response status:', response.status);

    if (response.ok) {
      const result = await response.json();
      console.log('Upload successful:', result);
      alert('Image uploaded successfully!');
      this.resetForm();
    } else {
      // Handle both JSON and HTML responses
      const responseText = await response.text();
      console.error('Upload failed. Response:', responseText);
      
      try {
        const errorData = JSON.parse(responseText);
        alert('Upload failed: ' + (errorData.error || 'Unknown error'));
      } catch {
        alert('Upload failed: Server returned unexpected response. Status: ' + response.status);
      }
    }
  } catch (error) {
    console.error('Network error:', error);
    alert('Network error: ' + error.message);
  }
},
  }
}
</script>

<style scoped>
.upload-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h2 {
  color: #333;
  margin: 0;
}

.nav-btn {
  background: #764ba2;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.nav-btn:hover {
  background: #6a4190;
}

.upload-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-input,
.form-textarea,
.form-file {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.image-preview {
  margin-top: 1rem;
  text-align: center;
}

.image-preview p {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  border: 2px solid #e1e5e9;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.submit-btn {
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

.submit-btn:hover {
  background: #5a6fd8;
}
</style>