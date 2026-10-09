const express = require('express');
const pool = require('../config/db');
const { requireStudent } = require('../middleware/auth');
const { runAutoMatchForLostItem } = require('../services/autoMatchService');

const router = express.Router();

// Every lost-item response also carries ImageURL: the item's first uploaded photo (null if it has none).
// "First" uses the same ordering as the matching code, so the photo shown is the photo that is compared.
const SELECT_ITEM = `SELECT l.*,
    (SELECT i.ImageURL FROM LOST_ITEM_IMAGE i WHERE i.LostID = l.LostID ORDER BY i.ImageURL LIMIT 1) AS ImageURL
    FROM LOST_ITEM l`;

// POST /api/lost-items - create (authed)
router.post('/', requireStudent, async (req, res) => {
    const { itemName, category, brand, color, description, dateLost, lostLocation } = req.body;

    if (!itemName) {
        return res.status(400).json({ error: 'itemName is required' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO LOST_ITEM (ItemName, Category, Brand, Color, Description, DateLost, LostLocation, StudentID)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [itemName, category || null, brand || null, color || null, description || null, dateLost || null, lostLocation || null, req.user.studentId]
        );

        const [rows] = await pool.query(`${SELECT_ITEM} WHERE l.LostID = ?`, [result.insertId]);
        res.status(201).json(rows[0]);

        // Look for matching found items in the background; the response above never waits on it.
        runAutoMatchForLostItem(rows[0].LostID).catch(console.error);
        return;
    } catch (err) {
        console.error('Create lost item error:', err);
        return res.status(500).json({ error: 'Failed to create lost item' });
    }
});

// GET /api/lost-items - list all
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`${SELECT_ITEM} ORDER BY l.LostID DESC`);
        return res.status(200).json(rows);
    } catch (err) {
        console.error('List lost items error:', err);
        return res.status(500).json({ error: 'Failed to fetch lost items' });
    }
});

// GET /api/lost-items/student/:studentId - list by student
router.get('/student/:studentId', async (req, res) => {
    try {
        const [rows] = await pool.query(`${SELECT_ITEM} WHERE l.StudentID = ? ORDER BY l.LostID DESC`, [req.params.studentId]);
        return res.status(200).json(rows);
    } catch (err) {
        console.error('List lost items by student error:', err);
        return res.status(500).json({ error: 'Failed to fetch lost items for student' });
    }
});

// GET /api/lost-items/:id - get by id
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`${SELECT_ITEM} WHERE l.LostID = ?`, [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Lost item not found' });
        }
        return res.status(200).json(rows[0]);
    } catch (err) {
        console.error('Get lost item error:', err);
        return res.status(500).json({ error: 'Failed to fetch lost item' });
    }
});

module.exports = router;
