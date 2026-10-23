const express = require('express');
const pool = require('../config/db');
const authenticate = require('../middleware/auth');
const { scorePairs } = require('../services/matchService');
const { createMatchNotification } = require('../services/notification.service');

const router = express.Router();

function httpError(statusCode, message) {
    const err = new Error(message);
    err.statusCode = statusCode;
    return err;
}

// GET /api/matches/candidates/:lostId - live-scored candidate found items for a lost item
// Scores are computed on the fly (never stored - MatchScore is a derived value, not a column).
router.get('/candidates/:lostId', authenticate, async (req, res) => {
    try {
        const [lostRows] = await pool.query('SELECT * FROM LOST_ITEM WHERE LostID = ?', [req.params.lostId]);
        if (lostRows.length === 0) {
            return res.status(404).json({ error: 'Lost item not found' });
        }
        const lostItem = lostRows[0];
        if (req.user.role !== 'admin' && lostItem.StudentID !== req.user.studentId) return res.status(403).json({ error: 'Only the reporter may view candidates' });
        if (!lostItem.AdminID || lostItem.Status !== 'Open') return res.json([]);

        // Only open found items that don't already have a confirmed match
        const [foundItems] = await pool.query(
            `SELECT f.*,
                    (SELECT i.ImageURL FROM FOUND_ITEM_IMAGE i WHERE i.FoundID = f.FoundID ORDER BY i.ImageURL LIMIT 1) AS ImageURL
             FROM FOUND_ITEM f
             WHERE f.Status = 'Open' AND f.AdminID IS NOT NULL AND f.StudentID <> ?
               AND NOT EXISTS (
                   SELECT 1 FROM MATCH_RECORD m
                   WHERE m.FoundID = f.FoundID AND m.MatchStatus = 'Confirmed'
               )`, [lostItem.StudentID]
        );

        // Text score for every candidate; photo score only for the best few (null when unavailable)
        const results = await scorePairs(foundItems.map((foundItem) => ({ lost: lostItem, found: foundItem })));
        const candidates = foundItems.map((foundItem, index) => ({
            foundItem,
            score: results[index].score,
            textScore: results[index].textScore,
            imageScore: results[index].imageScore
        }));

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

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        const [[found]] = await connection.query('SELECT * FROM FOUND_ITEM WHERE FoundID = ? FOR UPDATE', [foundId]);
        const [[lost]] = await connection.query('SELECT * FROM LOST_ITEM WHERE LostID = ? FOR UPDATE', [lostId]);
        if (!lost || !found) throw httpError(404, 'Report not found');
        if (req.user.role !== 'admin' && lost.StudentID !== req.user.studentId) throw httpError(403, 'Only the lost reporter may create a match');
        if (lost.StudentID === found.StudentID) throw httpError(409, 'Cannot match your own found report');
        if (lost.Status !== 'Open' || found.Status !== 'Open' || !lost.AdminID || !found.AdminID) throw httpError(409, 'Both reports must be verified and open');
        const [existing] = await connection.query("SELECT MatchID FROM MATCH_RECORD WHERE (LostID = ? AND FoundID = ?) OR (FoundID = ? AND MatchStatus = 'Confirmed')", [lostId, foundId, foundId]);
        if (existing.length) throw httpError(409, 'Pair already exists or found item is already matched');
        const [result] = await connection.query('INSERT INTO MATCH_RECORD (LostID, FoundID) VALUES (?, ?)', [lostId, foundId]);
        const [[match]] = await connection.query('SELECT * FROM MATCH_RECORD WHERE MatchID = ?', [result.insertId]);
        await connection.commit();
        return res.status(201).json(match);
    } catch (err) {
        if (connection) await connection.rollback();
        return res.status(err.statusCode || 500).json({ error: err.statusCode ? err.message : 'Failed to create match' });
    } finally { if (connection) connection.release(); }
});

// GET /api/matches - list all match records
router.get('/', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT m.* FROM MATCH_RECORD m JOIN LOST_ITEM l ON l.LostID = m.LostID JOIN FOUND_ITEM f ON f.FoundID = m.FoundID ${req.user.role === 'admin' ? '' : 'WHERE l.StudentID = ? OR f.StudentID = ?'} ORDER BY m.MatchID DESC`, req.user.role === 'admin' ? [] : [req.user.studentId, req.user.studentId]);
        return res.status(200).json(rows);
    } catch (err) {
        console.error('List matches error:', err);
        return res.status(500).json({ error: 'Failed to fetch match records' });
    }
});

// GET /api/matches/:id - get a match record by id
router.get('/:id', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT m.* FROM MATCH_RECORD m JOIN LOST_ITEM l ON l.LostID = m.LostID JOIN FOUND_ITEM f ON f.FoundID = m.FoundID WHERE m.MatchID = ? ${req.user.role === 'admin' ? '' : 'AND (l.StudentID = ? OR f.StudentID = ?)'}`, req.user.role === 'admin' ? [req.params.id] : [req.params.id, req.user.studentId, req.user.studentId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Match record not found' });
        }
        return res.status(200).json(rows[0]);
    } catch (err) {
        console.error('Get match error:', err);
        return res.status(500).json({ error: 'Failed to fetch match record' });
    }
});

// PATCH /api/matches/:id/status - update match status (authed: the lost item's owner, or an admin)
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

        const [refs] = await connection.query('SELECT FoundID, LostID FROM MATCH_RECORD WHERE MatchID = ?', [req.params.id]);
        if (!refs.length) throw httpError(404, 'Match record not found');
        await connection.query('SELECT FoundID FROM FOUND_ITEM WHERE FoundID = ? FOR UPDATE', [refs[0].FoundID]);
        await connection.query('SELECT LostID FROM LOST_ITEM WHERE LostID = ? FOR UPDATE', [refs[0].LostID]);
        const [rows] = await connection.query(
            'SELECT * FROM MATCH_RECORD WHERE MatchID = ? FOR UPDATE',
            [req.params.id]
        );
        if (rows.length === 0) {
            throw httpError(404, 'Match record not found');
        }
        match = rows[0];

        // Only the owner of the lost item (or an admin) may confirm, reject or reopen its match
        const [[lostOwner]] = await connection.query('SELECT StudentID FROM LOST_ITEM WHERE LostID = ?', [match.LostID]);
        if (req.user.role !== 'admin' && lostOwner.StudentID !== req.user.studentId) {
            throw httpError(403, 'Only the owner of the lost item or an admin can change this match');
        }

        const [[availability]] = await connection.query('SELECT Status, AdminID FROM FOUND_ITEM WHERE FoundID = ? FOR UPDATE', [match.FoundID]);
        const [[lostState]] = await connection.query('SELECT Status, AdminID FROM LOST_ITEM WHERE LostID = ? FOR UPDATE', [match.LostID]);
        if (['Claimed', 'Returned', 'Closed'].includes(availability.Status) || lostState.Status === 'Closed') throw httpError(409, 'This recovery is no longer open for match changes');
        if (status !== 'Rejected' && (!availability.AdminID || !lostState.AdminID)) throw httpError(409, 'Both reports must be verified');
        const [activeClaims] = await connection.query("SELECT ClaimID FROM CLAIM WHERE FoundID = ? AND ClaimStatus IN ('Pending','Approved')", [match.FoundID]);
        if (activeClaims.length && status !== match.MatchStatus) throw httpError(409, 'Resolve active claims with Campus Security first');
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
