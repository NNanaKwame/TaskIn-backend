// config/cloudinaryConfig.js
require('dotenv').config();  // Load environment variables

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with credentials from the environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // Cloudinary Cloud Name
  api_key: process.env.CLOUDINARY_API_KEY,      // Cloudinary API Key
  api_secret: process.env.CLOUDINARY_API_SECRET, // Cloudinary API Secret
});

// Set up Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'highlights', // Cloudinary folder where images will be stored
    allowed_formats: ['jpg', 'jpeg', 'png'], // Allowed image formats
    transformation: [{ width: 500, height: 500, crop: 'limit' }], // Optional transformation
  },
});

// Set up Multer for handling file uploads
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

module.exports = upload;
