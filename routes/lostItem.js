const express = require('express');
const pool = require('../config/db');
const authenticate = require('../middleware/auth');

const router = express.Router();

// POST /api/lost-items - create (authed)
router.post('/', authenticate, async (req, res) => {
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

        const [rows] = await pool.query('SELECT * FROM LOST_ITEM WHERE LostID = ?', [result.insertId]);
        return res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Create lost item error:', err);
        return res.status(500).json({ error: 'Failed to create lost item' });
    }
});

// GET /api/lost-items - list all
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM LOST_ITEM ORDER BY LostID DESC');
        return res.status(200).json(rows);
    } catch (err) {
        console.error('List lost items error:', err);
        return res.status(500).json({ error: 'Failed to fetch lost items' });
    }
});

// GET /api/lost-items/student/:studentId - list by student
router.get('/student/:studentId', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM LOST_ITEM WHERE StudentID = ? ORDER BY LostID DESC', [req.params.studentId]);
        return res.status(200).json(rows);
    } catch (err) {
        console.error('List lost items by student error:', err);
        return res.status(500).json({ error: 'Failed to fetch lost items for student' });
    }
});

// GET /api/lost-items/:id - get by id
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM LOST_ITEM WHERE LostID = ?', [req.params.id]);
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
