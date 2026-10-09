const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadLostMulter, uploadFoundMulter } = require('../config/upload');
const uploadController = require('../controllers/upload.controller');
const uploadService = require('../services/upload.service');
const { authenticate } = require('../middleware/auth');

/**
 * Only the student who reported an item (or an admin) may add photos to it.
 * Runs before Multer so a refused request never writes a file to disk.
 * @param {'lost' | 'found'} kind
 */
function requireItemOwnerOrAdmin(kind) {
  return async (req, res, next) => {
    if (req.user.role === 'admin') {
      return next();
    }

    try {
      const itemId = parseInt(kind === 'lost' ? req.params.lostId : req.params.foundId, 10);
      if (isNaN(itemId) || itemId <= 0) {
        return res.status(400).json({ message: `Invalid ${kind} item ID` });
      }

      const ownerId = kind === 'lost'
        ? await uploadService.getLostItemOwnerId(itemId)
        : await uploadService.getFoundItemOwnerId(itemId);

      if (ownerId !== req.user.studentId) {
        return res.status(403).json({ message: 'You can only add photos to your own reports' });
      }
      return next();
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      console.error('Error checking upload permission:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}

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
  authenticate,
  requireItemOwnerOrAdmin('lost'),
  handleMulterUpload(uploadLostMulter.array('images')),
  uploadController.uploadLostImages
);

// POST /api/uploads/found/:foundId - Upload image(s) for a found item
router.post(
  '/found/:foundId',
  authenticate,
  requireItemOwnerOrAdmin('found'),
  handleMulterUpload(uploadFoundMulter.array('images')),
  uploadController.uploadFoundImages
);

// GET /api/uploads/lost/:lostId - List images for a lost item
router.get('/lost/:lostId', uploadController.getLostImages);

// GET /api/uploads/found/:foundId - List images for a found item
router.get('/found/:foundId', uploadController.getFoundImages);

module.exports = router;
