const multer    = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// We need multer-storage-cloudinary — install it separately if missing
// npm install multer-storage-cloudinary

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'fashion-mission',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, quality: 'auto' }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
