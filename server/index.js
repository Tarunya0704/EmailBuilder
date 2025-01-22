
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
//app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/email-builder')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const EmailTemplate = mongoose.model('EmailTemplate', {
  name: String,
  layout: String,
  config: {
    sections: [String],
    title: String,
    content: String,
    imageUrl: String,
    footer: String,
    style: {
      titleColor: String,
      titleSize: String,
      titleAlignment: String,
      contentColor: String,
      contentSize: String,
      contentAlignment: String,
      footerColor: String,
      footerSize: String,
      footerAlignment: String,
      backgroundColor: String
    }
  },
  createdAt: { type: Date, default: Date.now }
});

// Storage configuration for multer
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// API Routes
// Get Email Layout
app.get('/api/getEmailLayout', async (req, res) => {
  try {
    const layoutPath = path.join(__dirname, 'layouts', 'default.html');
    const layout = await fs.readFile(layoutPath, 'utf-8');
    res.send(layout);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read layout file' });
  }
});

// Upload Image
app.post('/api/uploadImage', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Make sure to return an absolute URL
    //const fullUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    const fullUrl =`https://emailbuilderserver.onrender.com/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      url: fullUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Save Email Template
app.post('/api/uploadEmailConfig', async (req, res) => {
  try {
    const template = new EmailTemplate(req.body);
    await template.save();
    res.json({ success: true, template });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save template' });
  }
});

// Render and Download Template
app.post('/api/renderAndDownloadTemplate', async (req, res) => {
  try {
    const { templateId } = req.body;
    const template = await EmailTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const layoutPath = path.join(__dirname, 'layouts', 'default.html');
    let layoutHtml = await fs.readFile(layoutPath, 'utf-8');

    // Replace placeholders with template values
    layoutHtml = layoutHtml
      .replace('{{title}}', template.config.title)
      .replace('{{content}}', template.config.content)
      .replace('{{footer}}', template.config.footer)
      .replace('{{backgroundColor}}', template.config.style.backgroundColor)
      .replace('{{titleColor}}', template.config.style.titleColor)
      .replace('{{titleSize}}', template.config.style.titleSize)
      .replace('{{titleAlignment}}', template.config.style.titleAlignment)
      .replace('{{contentColor}}', template.config.style.contentColor)
      .replace('{{contentSize}}', template.config.style.contentSize)
      .replace('{{contentAlignment}}', template.config.style.contentAlignment)
      .replace('{{footerColor}}', template.config.style.footerColor)
      .replace('{{footerSize}}', template.config.style.footerSize)
      .replace('{{footerAlignment}}', template.config.style.footerAlignment);

    if (template.config.imageUrl) {
      layoutHtml = layoutHtml.replace('{{imageUrl}}', template.config.imageUrl);
    }

    res.set('Content-Type', 'text/html');
    res.send(layoutHtml);
  } catch (error) {
    res.status(500).json({ error: 'Failed to render template' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});