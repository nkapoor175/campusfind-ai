const express = require('express');
const pool = require('../config/db');
const authenticate = require('../middleware/auth');

const router = express.Router();

// POST /api/found-items - create (authed)
router.post('/', authenticate, async (req, res) => {
    const { itemName, category, brand, color, description, dateFound, foundLocation } = req.body;

    if (!itemName) {
        return res.status(400).json({ error: 'itemName is required' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO FOUND_ITEM (ItemName, Category, Brand, Color, Description, DateFound, FoundLocation, StudentID)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [itemName, category || null, brand || null, color || null, description || null, dateFound || null, foundLocation || null, req.user.studentId]
        );

        const [rows] = await pool.query('SELECT * FROM FOUND_ITEM WHERE FoundID = ?', [result.insertId]);
        return res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Create found item error:', err);
        return res.status(500).json({ error: 'Failed to create found item' });
    }
});

// GET /api/found-items - list all
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM FOUND_ITEM ORDER BY FoundID DESC');
        return res.status(200).json(rows);
    } catch (err) {
        console.error('List found items error:', err);
        return res.status(500).json({ error: 'Failed to fetch found items' });
    }
});

// GET /api/found-items/student/:studentId - list by student
router.get('/student/:studentId', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM FOUND_ITEM WHERE StudentID = ? ORDER BY FoundID DESC', [req.params.studentId]);
        return res.status(200).json(rows);
    } catch (err) {
        console.error('List found items by student error:', err);
        return res.status(500).json({ error: 'Failed to fetch found items for student' });
    }
});

// GET /api/found-items/:id - get by id
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM FOUND_ITEM WHERE FoundID = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Found item not found' });
        }
        return res.status(200).json(rows[0]);
    } catch (err) {
        console.error('Get found item error:', err);
        return res.status(500).json({ error: 'Failed to fetch found item' });
    }
});

module.exports = router;
