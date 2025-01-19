const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const connectDB = require('./config/database');
const EmailTemplate = require('./models/EmailTemplate');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/images');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
            return;
        }
        cb(null, true);
    }
});

// Routes

// 1. Get Email Layout
app.get('/api/getEmailLayout', async (req, res) => {
    try {
        const layoutName = req.query.name || 'default.html';
        const layoutPath = path.join(__dirname, '../layouts', layoutName);
        const layoutContent = await fs.readFile(layoutPath, 'utf-8');
        res.send({ success: true, layout: layoutContent });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error loading layout file'
        });
    }
});

// 2. Upload Image
app.post('/api/uploadImage', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file provided'
            });
        }

        const imageUrl = `${process.env.BASE_URL}/uploads/images/${req.file.filename}`;
        res.json({
            success: true,
            imageUrl
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error uploading image'
        });
    }
});

// 3. Save Email Template Configuration
app.post('/api/uploadEmailConfig', async (req, res) => {
    try {
        const { name, layout, config } = req.body;

        const template = new EmailTemplate({
            name,
            layout,
            config
        });

        await template.save();

        res.json({
            success: true,
            template
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error saving template configuration'
        });
    }
});

// 4. Render and Download Template
app.post('/api/renderAndDownloadTemplate', async (req, res) => {
    try {
        const { templateId } = req.body;
        
        const template = await EmailTemplate.findById(templateId);
        if (!template) {
            return res.status(404).json({
                success: false,
                error: 'Template not found'
            });
        }

        const layoutPath = path.join(__dirname, '../layouts', template.layout);
        const layoutContent = await fs.readFile(layoutPath, 'utf-8');

        // Replace variables in the layout content
        let finalHtml = layoutContent;
        if (template.config.variables) {
            for (const [key, value] of Object.entries(template.config.variables)) {
                finalHtml = finalHtml.replace(new RegExp(`{{${key}}}`, 'g'), value);
            }
        }

        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `attachment; filename=${template.name}.html`);
        res.send(finalHtml);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error rendering template'
        });
    }
});

const PORT = process.env.PORT || 5000;

// Connect to database then start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});