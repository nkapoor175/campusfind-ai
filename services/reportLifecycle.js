const pool = require('../config/db');
const { requireStudent } = require('../middleware/auth');

// Install the same ownership and terminal-state rules for both report types.
module.exports = function installReportLifecycle(router, kind) {
  const lost = kind === 'lost';
  const table = lost ? 'LOST_ITEM' : 'FOUND_ITEM';
  const idColumn = lost ? 'LostID' : 'FoundID';
  router.patch('/:id', requireStudent, async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();
      const [rows] = await connection.execute(`SELECT * FROM ${table} WHERE ${idColumn} = ? FOR UPDATE`, [req.params.id]);
      const item = rows[0];
      const fail = (statusCode, message) => { throw Object.assign(new Error(message), { statusCode }); };
      if (!item) fail(404, 'Report not found');
      if (item.StudentID !== req.user.studentId) fail(403, 'Only the reporter may change this report');
      if (item.Status !== 'Open') fail(409, 'Only open reports can be edited or closed');
      const [claims] = await connection.execute(lost
        ? "SELECT ClaimID FROM CLAIM WHERE LostID = ? AND ClaimStatus IN ('Pending','Approved')"
        : "SELECT ClaimID FROM CLAIM WHERE FoundID = ? AND ClaimStatus IN ('Pending','Approved')", [item[idColumn]]);
      const [matches] = await connection.execute(`SELECT MatchID FROM MATCH_RECORD WHERE ${idColumn} = ? AND MatchStatus = 'Confirmed'`, [item[idColumn]]);
      if (claims.length || matches.length) fail(409, 'Resolve active claims and confirmed matches with Campus Security first');
      if (req.body.action === 'close') {
        await connection.execute(`UPDATE ${table} SET Status = 'Closed' WHERE ${idColumn} = ?`, [item[idColumn]]);
      } else {
        const fields = { itemName: 'ItemName', category: 'Category', brand: 'Brand', color: 'Color', description: 'Description', [lost ? 'lostLocation' : 'foundLocation']: lost ? 'LostLocation' : 'FoundLocation', [lost ? 'dateLost' : 'dateFound']: lost ? 'DateLost' : 'DateFound' };
        const updates = [], values = [];
        for (const [key, column] of Object.entries(fields)) {
          if (!(key in req.body)) continue;
          const value = req.body[key];
          if (typeof value !== 'string' || value.length > (key === 'description' ? 5000 : key === 'color' ? 50 : 100)) fail(400, `Invalid ${key}`);
          if (key === 'itemName' && !value.trim()) fail(400, 'Item name is required');
          if (key.startsWith('date') && value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value)) fail(400, 'Use a valid date');
          updates.push(`${column} = ?`); values.push(value.trim() || null);
        }
        if (!updates.length) fail(400, 'No editable fields supplied');
        await connection.execute(`UPDATE ${table} SET ${updates.join(', ')}, AdminID = NULL WHERE ${idColumn} = ?`, [...values, item[idColumn]]);
      }
      // Recompute old suggestions after re-verification; preserve explicit Not Mine decisions.
      if (req.body.action === 'close') {
        await connection.execute(`UPDATE MATCH_RECORD SET MatchStatus = 'Rejected' WHERE ${idColumn} = ? AND MatchStatus = 'Pending'`, [item[idColumn]]);
      } else {
        await connection.execute(`DELETE n FROM NOTIFICATION n JOIN MATCH_RECORD m ON m.MatchID = n.MatchID WHERE m.${idColumn} = ? AND m.MatchStatus = 'Pending'`, [item[idColumn]]);
        await connection.execute(`DELETE FROM MATCH_RECORD WHERE ${idColumn} = ? AND MatchStatus = 'Pending'`, [item[idColumn]]);
      }
      const [updated] = await connection.execute(`SELECT * FROM ${table} WHERE ${idColumn} = ?`, [item[idColumn]]);
      await connection.commit(); res.json(updated[0]);
    } catch (err) {
      if (connection) await connection.rollback();
      res.status(err.statusCode || 500).json({ message: err.statusCode ? err.message : 'Failed to update report' });
    } finally { if (connection) connection.release(); }
  });
};
