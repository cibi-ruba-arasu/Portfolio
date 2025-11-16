import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';

// Load environment variables
dotenv.config();

console.log('=== Backend Server Starting ===');
console.log('Port:', process.env.PORT || 5000);

// Validate environment variables
console.log('\n=== Environment Variables Check ===');
console.log('S3_ACCESS_KEY:', process.env.S3_ACCESS_KEY ? '✅ Set' : '❌ Missing');
console.log('S3_SECRET_KEY:', process.env.S3_SECRET_KEY ? '✅ Set' : '❌ Missing');
console.log('S3_BUCKET_LOC:', process.env.S3_BUCKET_LOC ? '✅ Set' : '❌ Missing');
console.log('S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME ? '✅ Set' : '❌ Missing');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Allow frontend to connect
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure AWS S3 v3
const s3 = new S3Client({
  region: process.env.S3_BUCKET_LOC,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY
  }
});

// MongoDB Schema
const imageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Image = mongoose.model('Image', imageSchema);

// Configure multer for S3 upload (without ACL)
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    // Remove acl since your bucket has ACLs disabled
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileName = `images/${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
    // Add this for public read access without ACL
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload image endpoint
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    console.log('Upload request received:', req.body);
    
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    console.log('File uploaded to S3:', req.file.location);

    // Save to MongoDB
    const imageData = new Image({
      title,
      description,
      imageUrl: req.file.location
    });

    const savedImage = await imageData.save();
    console.log('Image saved to database:', savedImage._id);

    res.status(201).json({
      message: 'Image uploaded successfully',
      image: savedImage
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all images endpoint
app.get('/api/images', async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: error.message });
  }
});

// Simple health check route
app.get('/api/health', (req, res) => {
  res.json({
    message: 'Server is running!',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    s3: 'Configured',
    timestamp: new Date().toISOString()
  });
});

// Test S3 connection
async function testS3Connection() {
  try {
    console.log('\n=== Testing S3 Connection ===');
    const command = new ListBucketsCommand({});
    const result = await s3.send(command);
    console.log('✅ S3 Connection Successful');
    console.log('Available buckets:');
    result.Buckets.forEach(bucket => {
      console.log(`  - ${bucket.Name} (Created: ${bucket.CreationDate})`);
    });
    
    // Check if our target bucket exists
    const targetBucket = process.env.S3_BUCKET_NAME;
    const bucketExists = result.Buckets.some(bucket => bucket.Name === targetBucket);
    if (bucketExists) {
      console.log(`✅ Target bucket "${targetBucket}" exists`);
    } else {
      console.log(`❌ Target bucket "${targetBucket}" not found`);
    }
  } catch (error) {
    console.log('❌ S3 Connection Failed:', error.message);
  }
}

// MongoDB connection
async function connectMongoDB() {
  try {
    console.log('\n=== Connecting to MongoDB ===');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.log('❌ MongoDB Connection Failed:', error.message);
  }
}

// Start server and test connections
async function startServer() {
  try {
    // Test connections
    await testS3Connection();
    await connectMongoDB();
    
    // Start the server
    app.listen(PORT, () => {
      console.log('\n=== Server Status ===');
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📤 Upload endpoint: http://localhost:${PORT}/api/upload`);
      console.log(`📥 Get images: http://localhost:${PORT}/api/images`);
      console.log('✅ Ready for file uploads!');
    });
  } catch (error) {
    console.log('❌ Server startup failed:', error.message);
    process.exit(1);
  }
}

// Start everything
startServer();