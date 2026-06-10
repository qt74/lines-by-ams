const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

// ── Cloudinary (production) vs disk (local dev) ────────────────────
const useCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

let storage;

if (useCloudinary) {
  const cloudinary        = require('../config/cloudinary');
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder:         'linesbyams',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
      public_id:      `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    }),
  });

  console.log('[upload] Using Cloudinary storage');
} else {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename:    (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      cb(null, unique + path.extname(file.originalname).toLowerCase());
    },
  });

  console.log('[upload] Using local disk storage');
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok =
      allowed.test(path.extname(file.originalname).toLowerCase()) &&
      allowed.test(file.mimetype);
    if (ok) cb(null, true);
    else    cb(new Error('Only images are allowed (jpg, png, webp)'));
  },
});

module.exports = upload;
