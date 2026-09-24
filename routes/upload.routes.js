const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadLostMulter, uploadFoundMulter } = require('../config/upload');
const uploadController = require('../controllers/upload.controller');

/**
 * Middleware wrapper for Multer upload error handling
 */
function handleMulterUpload(multerMiddleware) {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File size exceeds maximum limit of 5 MB per image' });
          }
          return res.status(400).json({ message: `Upload error: ${err.message}` });
        }
        if (err.code === 'INVALID_FILE_TYPE') {
          return res.status(400).json({ message: err.message });
        }
        return res.status(400).json({ message: err.message || 'Error processing file upload' });
      }
      next();
    });
  };
}

// POST /api/uploads/lost/:lostId - Upload image(s) for a lost item
router.post(
  '/lost/:lostId',
  handleMulterUpload(uploadLostMulter.array('images')),
  uploadController.uploadLostImages
);

// POST /api/uploads/found/:foundId - Upload image(s) for a found item
router.post(
  '/found/:foundId',
  handleMulterUpload(uploadFoundMulter.array('images')),
  uploadController.uploadFoundImages
);

// GET /api/uploads/lost/:lostId - List images for a lost item
router.get('/lost/:lostId', uploadController.getLostImages);

// GET /api/uploads/found/:foundId - List images for a found item
router.get('/found/:foundId', uploadController.getFoundImages);

module.exports = router;
