const fs = require('fs');
const uploadService = require('../services/upload.service');

/**
 * Clean up uploaded files from disk if processing fails
 * @param {Array} files 
 */
function cleanupFiles(files) {
  if (!files || !Array.isArray(files)) return;
  for (const file of files) {
    try {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (err) {
      console.error('Failed to cleanup file:', file.path, err);
    }
  }
}

/**
 * POST /api/uploads/lost/:lostId
 * Upload image(s) for a lost item
 */
async function uploadLostImages(req, res) {
  try {
    const lostId = parseInt(req.params.lostId, 10);

    if (isNaN(lostId) || lostId <= 0) {
      cleanupFiles(req.files);
      return res.status(400).json({ message: 'Invalid lost item ID' });
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided under field name "images"' });
    }

    // Construct relative URLs stored in database (e.g., /uploads/lost/filename.jpg)
    const imageUrls = req.files.map(file => `/uploads/lost/${file.filename}`);

    try {
      const savedImages = await uploadService.addLostItemImages(lostId, imageUrls);
      return res.status(201).json({
        message: 'Lost item image(s) uploaded successfully',
        lostId,
        images: savedImages,
      });
    } catch (dbError) {
      // If item does not exist or DB insertion failed, delete files from disk
      cleanupFiles(req.files);
      throw dbError;
    }
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Error in uploadLostImages:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * POST /api/uploads/found/:foundId
 * Upload image(s) for a found item
 */
async function uploadFoundImages(req, res) {
  try {
    const foundId = parseInt(req.params.foundId, 10);

    if (isNaN(foundId) || foundId <= 0) {
      cleanupFiles(req.files);
      return res.status(400).json({ message: 'Invalid found item ID' });
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided under field name "images"' });
    }

    // Construct relative URLs stored in database (e.g., /uploads/found/filename.jpg)
    const imageUrls = req.files.map(file => `/uploads/found/${file.filename}`);

    try {
      const savedImages = await uploadService.addFoundItemImages(foundId, imageUrls);
      return res.status(201).json({
        message: 'Found item image(s) uploaded successfully',
        foundId,
        images: savedImages,
      });
    } catch (dbError) {
      // If item does not exist or DB insertion failed, delete files from disk
      cleanupFiles(req.files);
      throw dbError;
    }
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Error in uploadFoundImages:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * GET /api/uploads/lost/:lostId
 * List all images associated with a lost item
 */
async function getLostImages(req, res) {
  try {
    const lostId = parseInt(req.params.lostId, 10);

    if (isNaN(lostId) || lostId <= 0) {
      return res.status(400).json({ message: 'Invalid lost item ID' });
    }

    const images = await uploadService.getLostItemImages(lostId);
    return res.status(200).json(images);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Error in getLostImages:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * GET /api/uploads/found/:foundId
 * List all images associated with a found item
 */
async function getFoundImages(req, res) {
  try {
    const foundId = parseInt(req.params.foundId, 10);

    if (isNaN(foundId) || foundId <= 0) {
      return res.status(400).json({ message: 'Invalid found item ID' });
    }

    const images = await uploadService.getFoundItemImages(foundId);
    return res.status(200).json(images);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Error in getFoundImages:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  uploadLostImages,
  uploadFoundImages,
  getLostImages,
  getFoundImages,
};
