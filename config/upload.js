const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const UPLOADS_BASE = path.join(__dirname, '../uploads');

// Ensure destination directories exist
const lostUploadDir = path.join(UPLOADS_BASE, 'lost');
const foundUploadDir = path.join(UPLOADS_BASE, 'found');

if (!fs.existsSync(lostUploadDir)) {
  fs.mkdirSync(lostUploadDir, { recursive: true });
}
if (!fs.existsSync(foundUploadDir)) {
  fs.mkdirSync(foundUploadDir, { recursive: true });
}

/**
 * Configure Multer storage for a specific upload type ('lost' or 'found')
 * @param {'lost' | 'found'} type 
 */
function createStorage(type) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      const targetDir = type === 'lost' ? lostUploadDir : foundUploadDir;
      cb(null, targetDir);
    },
    filename: (req, file, cb) => {
      const id = req.params.lostId || req.params.foundId || 'item';
      const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `${type}-${id}-${uniqueSuffix}${ext}`);
    },
  });
}

/**
 * File filter to accept only valid image MIME types
 */
function imageFileFilter(_req, file, cb) {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed.');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
}

// Multer instances for lost and found items (5MB per image limit)
const uploadLostMulter = multer({
  storage: createStorage('lost'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const uploadFoundMulter = multer({
  storage: createStorage('found'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

module.exports = {
  uploadLostMulter,
  uploadFoundMulter,
};
