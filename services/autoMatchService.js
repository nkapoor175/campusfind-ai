const pool = require('../config/db');
const { scoreMatch } = require('./matchService');
const { createMatchNotification } = require('./notification.service');

// Pairs scoring at or above this get a Pending MATCH_RECORD automatically.
const parsedThreshold = parseFloat(process.env.AUTO_MATCH_THRESHOLD);
const AUTO_MATCH_THRESHOLD = Number.isNaN(parsedThreshold) ? 0.7 : parsedThreshold;
const MAX_MATCHES_PER_RUN = 3;

// Runs are queued one at a time. Two overlapping runs (e.g. the run for a new item and the
// re-run after its photo upload) could otherwise both see "no record yet" and insert the same
// pair twice, and MATCH_RECORD has no unique key on (LostID, FoundID) to stop that.
let queue = Promise.resolve();
function serialize(task) {
    const result = queue.then(task);
    queue = result.catch(() => {});
    return result;
}

function percent(score) {
    return Math.round(score * 100);
}

// Scores every {lost, found} pair, keeps the best MAX_MATCHES_PER_RUN at or above the
// threshold, and returns them best-first. Pairs that already have a record still take part
// in the ranking (so a re-run never surfaces a 4th-best pair); they are just not inserted again.
async function rankPairs(pairs) {
    const scored = await Promise.all(
        pairs.map(async ({ lost, found }) => ({ lost, found, score: await scoreMatch(lost, found) }))
    );
    return scored
        .filter((c) => c.score >= AUTO_MATCH_THRESHOLD)
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_MATCHES_PER_RUN);
}

async function createPendingMatch(lost, found, score) {
    const [result] = await pool.query(
        "INSERT INTO MATCH_RECORD (LostID, FoundID, MatchStatus) VALUES (?, ?, 'Pending')",
        [lost.LostID, found.FoundID]
    );
    const matchId = result.insertId;
    const pct = percent(score);

    // A failed notification must not undo the match record.
    try {
        await createMatchNotification(
            matchId,
            lost.StudentID,
            `Possible match for your lost "${lost.ItemName}": a found item "${found.ItemName}" looks similar (${pct}%). Open Matches to review.`
        );
        await createMatchNotification(
            matchId,
            found.StudentID,
            `The item you found ("${found.ItemName}") may belong to someone who lost "${lost.ItemName}" (${pct}%).`
        );
    } catch (notifyErr) {
        console.error(`Auto-match: failed to notify for match ${matchId}:`, notifyErr);
    }
    return matchId;
}

async function insertMissing(ranked, existing) {
    for (const { lost, found, score } of ranked) {
        if (existing.has(`${lost.LostID}:${found.FoundID}`)) continue;
        try {
            await createPendingMatch(lost, found, score);
        } catch (err) {
            console.error(`Auto-match: failed to create match for lost ${lost.LostID} / found ${found.FoundID}:`, err);
        }
    }
}

async function matchLostItem(lostId) {
    const [lostRows] = await pool.query('SELECT * FROM LOST_ITEM WHERE LostID = ?', [lostId]);
    if (lostRows.length === 0 || lostRows[0].Status !== 'Open') return;
    const lostItem = lostRows[0];

    // Open found items from other students that don't already have a confirmed match
    const [foundItems] = await pool.query(
        `SELECT f.* FROM FOUND_ITEM f
         WHERE f.Status = 'Open'
           AND f.StudentID <> ?
           AND NOT EXISTS (
               SELECT 1 FROM MATCH_RECORD m
               WHERE m.FoundID = f.FoundID AND m.MatchStatus = 'Confirmed'
           )`,
        [lostItem.StudentID]
    );

    const [records] = await pool.query('SELECT LostID, FoundID FROM MATCH_RECORD WHERE LostID = ?', [lostId]);
    const existing = new Set(records.map((p) => `${p.LostID}:${p.FoundID}`));

    const ranked = await rankPairs(foundItems.map((found) => ({ lost: lostItem, found })));
    await insertMissing(ranked, existing);
}

async function matchFoundItem(foundId) {
    const [foundRows] = await pool.query('SELECT * FROM FOUND_ITEM WHERE FoundID = ?', [foundId]);
    if (foundRows.length === 0 || foundRows[0].Status !== 'Open') return;
    const foundItem = foundRows[0];

    const [confirmed] = await pool.query(
        "SELECT MatchID FROM MATCH_RECORD WHERE FoundID = ? AND MatchStatus = 'Confirmed' LIMIT 1",
        [foundId]
    );
    if (confirmed.length > 0) return;

    // Open lost items from other students
    const [lostItems] = await pool.query(
        "SELECT * FROM LOST_ITEM WHERE Status = 'Open' AND StudentID <> ?",
        [foundItem.StudentID]
    );

    const [records] = await pool.query('SELECT LostID, FoundID FROM MATCH_RECORD WHERE FoundID = ?', [foundId]);
    const existing = new Set(records.map((p) => `${p.LostID}:${p.FoundID}`));

    const ranked = await rankPairs(lostItems.map((lost) => ({ lost, found: foundItem })));
    await insertMissing(ranked, existing);
}

// Both entry points are safe to call without await: they never throw, and are idempotent.
function runAutoMatchForLostItem(lostId) {
    return serialize(() => matchLostItem(lostId)).catch((err) => {
        console.error(`Auto-match failed for lost item ${lostId}:`, err);
    });
}

function runAutoMatchForFoundItem(foundId) {
    return serialize(() => matchFoundItem(foundId)).catch((err) => {
        console.error(`Auto-match failed for found item ${foundId}:`, err);
    });
}

module.exports = { runAutoMatchForLostItem, runAutoMatchForFoundItem };
