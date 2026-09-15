const express = require('express');
const pool = require('../config/db');
const authenticate = require('../middleware/auth');
const { scoreMatch } = require('../services/matchService');

const router = express.Router();

// GET /api/matches/candidates/:lostId - live-scored candidate found items for a lost item
// Scores are computed on the fly (never stored - MatchScore is a derived value, not a column).
router.get('/candidates/:lostId', async (req, res) => {
    try {
        const [lostRows] = await pool.query('SELECT * FROM LOST_ITEM WHERE LostID = ?', [req.params.lostId]);
        if (lostRows.length === 0) {
            return res.status(404).json({ error: 'Lost item not found' });
        }
        const lostItem = lostRows[0];

        const [foundItems] = await pool.query("SELECT * FROM FOUND_ITEM WHERE Status = 'Open'");

        const candidates = await Promise.all(
            foundItems.map(async (foundItem) => ({
                foundItem,
                score: await scoreMatch(lostItem, foundItem)
            }))
        );

        candidates.sort((a, b) => b.score - a.score);

        return res.status(200).json(candidates);
    } catch (err) {
        console.error('Get match candidates error:', err);
        return res.status(500).json({ error: 'Failed to compute match candidates' });
    }
});

// POST /api/matches - create a match record between a lost item and a found item (authed)
router.post('/', authenticate, async (req, res) => {
    const { lostId, foundId } = req.body;

    if (!lostId || !foundId) {
        return res.status(400).json({ error: 'lostId and foundId are required' });
    }

    try {
        const [lostRows] = await pool.query('SELECT LostID FROM LOST_ITEM WHERE LostID = ?', [lostId]);
        if (lostRows.length === 0) {
            return res.status(404).json({ error: 'Lost item not found' });
        }

        const [foundRows] = await pool.query('SELECT FoundID FROM FOUND_ITEM WHERE FoundID = ?', [foundId]);
        if (foundRows.length === 0) {
            return res.status(404).json({ error: 'Found item not found' });
        }

        const [result] = await pool.query(
            'INSERT INTO MATCH_RECORD (LostID, FoundID) VALUES (?, ?)',
            [lostId, foundId]
        );

        const [rows] = await pool.query('SELECT * FROM MATCH_RECORD WHERE MatchID = ?', [result.insertId]);
        return res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Create match error:', err);
        return res.status(500).json({ error: 'Failed to create match record' });
    }
});

// GET /api/matches - list all match records
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM MATCH_RECORD ORDER BY MatchID DESC');
        return res.status(200).json(rows);
    } catch (err) {
        console.error('List matches error:', err);
        return res.status(500).json({ error: 'Failed to fetch match records' });
    }
});

// GET /api/matches/:id - get a match record by id
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM MATCH_RECORD WHERE MatchID = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Match record not found' });
        }
        return res.status(200).json(rows[0]);
    } catch (err) {
        console.error('Get match error:', err);
        return res.status(500).json({ error: 'Failed to fetch match record' });
    }
});

// PATCH /api/matches/:id/status - update match status (authed)
router.patch('/:id/status', authenticate, async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Rejected'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `status must be one of ${validStatuses.join(', ')}` });
    }

    try {
        const [rows] = await pool.query('SELECT * FROM MATCH_RECORD WHERE MatchID = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Match record not found' });
        }

        await pool.query('UPDATE MATCH_RECORD SET MatchStatus = ? WHERE MatchID = ?', [status, req.params.id]);

        const [updated] = await pool.query('SELECT * FROM MATCH_RECORD WHERE MatchID = ?', [req.params.id]);
        return res.status(200).json(updated[0]);
    } catch (err) {
        console.error('Update match status error:', err);
        return res.status(500).json({ error: 'Failed to update match status' });
    }
});

module.exports = router;
