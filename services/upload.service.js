const pool = require('../config/db');

/**
 * Save image URLs for a lost item
 * @param {number} lostId 
 * @param {string[]} imageUrls 
 */
async function addLostItemImages(lostId, imageUrls) {
  // Check if lost item exists
  const [itemRows] = await pool.execute(
    'SELECT LostID FROM LOST_ITEM WHERE LostID = ?',
    [lostId]
  );
  if (itemRows.length === 0) {
    const error = new Error('Lost item not found');
    error.statusCode = 404;
    throw error;
  }

  // Insert image records
  for (const url of imageUrls) {
    await pool.execute(
      'INSERT IGNORE INTO LOST_ITEM_IMAGE (LostID, ImageURL) VALUES (?, ?)',
      [lostId, url]
    );
  }

  const [images] = await pool.execute(
    'SELECT ImageURL FROM LOST_ITEM_IMAGE WHERE LostID = ?',
    [lostId]
  );

  return images;
}

/**
 * Save image URLs for a found item
 * @param {number} foundId 
 * @param {string[]} imageUrls 
 */
async function addFoundItemImages(foundId, imageUrls) {
  // Check if found item exists
  const [itemRows] = await pool.execute(
    'SELECT FoundID FROM FOUND_ITEM WHERE FoundID = ?',
    [foundId]
  );
  if (itemRows.length === 0) {
    const error = new Error('Found item not found');
    error.statusCode = 404;
    throw error;
  }

  // Insert image records
  for (const url of imageUrls) {
    await pool.execute(
      'INSERT IGNORE INTO FOUND_ITEM_IMAGE (FoundID, ImageURL) VALUES (?, ?)',
      [foundId, url]
    );
  }

  const [images] = await pool.execute(
    'SELECT ImageURL FROM FOUND_ITEM_IMAGE WHERE FoundID = ?',
    [foundId]
  );

  return images;
}

/**
 * List all images associated with a lost item
 * @param {number} lostId 
 */
async function getLostItemImages(lostId) {
  // Check if lost item exists
  const [itemRows] = await pool.execute(
    'SELECT LostID FROM LOST_ITEM WHERE LostID = ?',
    [lostId]
  );
  if (itemRows.length === 0) {
    const error = new Error('Lost item not found');
    error.statusCode = 404;
    throw error;
  }

  const [images] = await pool.execute(
    'SELECT ImageURL FROM LOST_ITEM_IMAGE WHERE LostID = ?',
    [lostId]
  );

  return images;
}

/**
 * List all images associated with a found item
 * @param {number} foundId 
 */
async function getFoundItemImages(foundId) {
  // Check if found item exists
  const [itemRows] = await pool.execute(
    'SELECT FoundID FROM FOUND_ITEM WHERE FoundID = ?',
    [foundId]
  );
  if (itemRows.length === 0) {
    const error = new Error('Found item not found');
    error.statusCode = 404;
    throw error;
  }

  const [images] = await pool.execute(
    'SELECT ImageURL FROM FOUND_ITEM_IMAGE WHERE FoundID = ?',
    [foundId]
  );

  return images;
}

module.exports = {
  addLostItemImages,
  addFoundItemImages,
  getLostItemImages,
  getFoundItemImages,
};
