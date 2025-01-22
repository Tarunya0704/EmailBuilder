
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Basic health check route
app.get('/', (req, res) => {
  res.json({
    status: 'Server is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  const uploadDir = path.join(__dirname, 'public', 'uploads');
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
    console.log('Created uploads directory');
  }
};

// Call it when server starts
ensureUploadsDir().catch(console.error);

// Your existing MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/email-builder')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Rest of your existing code remains exactly the same...
// [Keep all your existing code here]

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server URL: ${process.env.NODE_ENV === 'production' ? 'https://your-production-url.com' : 'http://localhost:' + PORT}`);
});