const express = require('express');
const pool = require('../config/db');
const authenticate = require('../middleware/auth');
const { scoreMatch } = require('../services/matchService');
const { createMatchNotification } = require('../services/notification.service');

const router = express.Router();

function httpError(statusCode, message) {
    const err = new Error(message);
    err.statusCode = statusCode;
    return err;
}

// GET /api/matches/candidates/:lostId - live-scored candidate found items for a lost item
// Scores are computed on the fly (never stored - MatchScore is a derived value, not a column).
router.get('/candidates/:lostId', async (req, res) => {
    try {
        const [lostRows] = await pool.query('SELECT * FROM LOST_ITEM WHERE LostID = ?', [req.params.lostId]);
        if (lostRows.length === 0) {
            return res.status(404).json({ error: 'Lost item not found' });
        }
        const lostItem = lostRows[0];

        // Only open found items that don't already have a confirmed match
        const [foundItems] = await pool.query(
            `SELECT f.* FROM FOUND_ITEM f
             WHERE f.Status = 'Open'
               AND NOT EXISTS (
                   SELECT 1 FROM MATCH_RECORD m
                   WHERE m.FoundID = f.FoundID AND m.MatchStatus = 'Confirmed'
               )`
        );

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
        const [lostRows] = await pool.query('SELECT LostID, Status FROM LOST_ITEM WHERE LostID = ?', [lostId]);
        if (lostRows.length === 0) {
            return res.status(404).json({ error: 'Lost item not found' });
        }
        if (lostRows[0].Status !== 'Open') {
            return res.status(409).json({ error: 'Lost item is not open for matching' });
        }

        const [foundRows] = await pool.query('SELECT FoundID, Status FROM FOUND_ITEM WHERE FoundID = ?', [foundId]);
        if (foundRows.length === 0) {
            return res.status(404).json({ error: 'Found item not found' });
        }
        if (foundRows[0].Status !== 'Open') {
            return res.status(409).json({ error: 'Found item is not open for matching' });
        }

        const [confirmed] = await pool.query(
            "SELECT MatchID FROM MATCH_RECORD WHERE FoundID = ? AND MatchStatus = 'Confirmed' LIMIT 1",
            [foundId]
        );
        if (confirmed.length > 0) {
            return res.status(409).json({ error: 'Found item already has a confirmed match' });
        }

        const [existing] = await pool.query(
            'SELECT MatchID FROM MATCH_RECORD WHERE LostID = ? AND FoundID = ? LIMIT 1',
            [lostId, foundId]
        );
        if (existing.length > 0) {
            return res.status(409).json({ error: 'A match record for this lost and found item already exists' });
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
//
// The match update and the lost item's status change run in one transaction:
//   - into Confirmed:  LOST_ITEM.Status becomes 'Matched'
//   - out of Confirmed: LOST_ITEM.Status goes back to 'Open', but only if it is
//     currently 'Matched' and no other Confirmed match exists for that lost item
// Notifications go out after the commit, only on the transition INTO Confirmed.
// A notification failure does NOT roll back the status update - the match itself is the
// source of truth; a missed notification is a lesser failure than losing the match update.
router.patch('/:id/status', authenticate, async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Rejected'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `status must be one of ${validStatuses.join(', ')}` });
    }

    let connection;
    try {
        connection = await pool.getConnection();
    } catch (err) {
        console.error('Update match status error (no DB connection):', err);
        return res.status(500).json({ error: 'Failed to update match status' });
    }

    let match;
    let updatedMatch;
    let becameConfirmed = false;

    try {
        await connection.beginTransaction();

        const [rows] = await connection.query(
            'SELECT * FROM MATCH_RECORD WHERE MatchID = ? FOR UPDATE',
            [req.params.id]
        );
        if (rows.length === 0) {
            throw httpError(404, 'Match record not found');
        }
        match = rows[0];

        const wasConfirmed = match.MatchStatus === 'Confirmed';
        becameConfirmed = status === 'Confirmed' && !wasConfirmed;
        const leftConfirmed = wasConfirmed && status !== 'Confirmed';

        if (becameConfirmed) {
            // Lock both items, then make sure neither is already spoken for
            const [[lostItem]] = await connection.query(
                'SELECT Status FROM LOST_ITEM WHERE LostID = ? FOR UPDATE', [match.LostID]
            );
            const [[foundItem]] = await connection.query(
                'SELECT Status FROM FOUND_ITEM WHERE FoundID = ? FOR UPDATE', [match.FoundID]
            );
            if (lostItem.Status !== 'Open') {
                throw httpError(409, 'Lost item is not open (already matched or closed)');
            }
            if (foundItem.Status !== 'Open') {
                throw httpError(409, 'Found item is not open (already claimed or returned)');
            }
            const [otherConfirmed] = await connection.query(
                "SELECT MatchID FROM MATCH_RECORD WHERE FoundID = ? AND MatchStatus = 'Confirmed' AND MatchID <> ? LIMIT 1",
                [match.FoundID, match.MatchID]
            );
            if (otherConfirmed.length > 0) {
                throw httpError(409, 'Found item already has a confirmed match');
            }
        }

        await connection.query('UPDATE MATCH_RECORD SET MatchStatus = ? WHERE MatchID = ?', [status, match.MatchID]);

        if (becameConfirmed) {
            await connection.query("UPDATE LOST_ITEM SET Status = 'Matched' WHERE LostID = ?", [match.LostID]);
        } else if (leftConfirmed) {
            await connection.query(
                `UPDATE LOST_ITEM SET Status = 'Open'
                 WHERE LostID = ? AND Status = 'Matched'
                   AND NOT EXISTS (
                       SELECT 1 FROM MATCH_RECORD
                       WHERE LostID = ? AND MatchStatus = 'Confirmed'
                   )`,
                [match.LostID, match.LostID]
            );
        }

        const [updated] = await connection.query('SELECT * FROM MATCH_RECORD WHERE MatchID = ?', [match.MatchID]);
        updatedMatch = updated[0];

        await connection.commit();
    } catch (err) {
        await connection.rollback();
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        console.error('Update match status error:', err);
        return res.status(500).json({ error: 'Failed to update match status' });
    } finally {
        connection.release();
    }

    // Fire notifications only on the transition INTO Confirmed, not on every
    // PATCH call, so re-confirming or updating other fields doesn't spam duplicates.
    if (becameConfirmed) {
        try {
            const [[lostItem]] = await pool.query(
                'SELECT StudentID, ItemName FROM LOST_ITEM WHERE LostID = ?', [match.LostID]
            );
            const [[foundItem]] = await pool.query(
                'SELECT StudentID, ItemName FROM FOUND_ITEM WHERE FoundID = ?', [match.FoundID]
            );

            if (lostItem) {
                await createMatchNotification(
                    match.MatchID,
                    lostItem.StudentID,
                    `Your lost item "${lostItem.ItemName}" has a confirmed match. Check your matches.`
                );
            }
            if (foundItem) {
                await createMatchNotification(
                    match.MatchID,
                    foundItem.StudentID,
                    `A lost-item report matching the item you found ("${foundItem.ItemName}") was confirmed. The owner may file a claim.`
                );
            }
        } catch (notifyErr) {
            console.error('Failed to create match notifications:', notifyErr);
        }
    }

    return res.status(200).json(updatedMatch);
});

module.exports = router;
