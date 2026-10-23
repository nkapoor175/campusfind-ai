// Integration regression tests. Use only a disposable *_test database and backend.
// DB_* must point at that database; RECOVERY_TEST_URL must point at its backend.
const assert = require('node:assert/strict');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function main() {
  assert.match(process.env.DB_NAME || '', /_test$/, 'Use a disposable *_test database');
  assert.ok(process.env.RECOVERY_TEST_URL, 'Set RECOVERY_TEST_URL to the isolated backend');
  const db = await mysql.createConnection({ host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
  const run = Date.now();
  let checks = 0;
  const call = async (method, path, token, body, expected = 200) => {
    const res = await fetch(process.env.RECOVERY_TEST_URL + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
    const data = await res.json();
    assert.equal(res.status, expected, `${method} ${path}: ${JSON.stringify(data)}`);
    checks++;
    return data;
  };
  try {
    const email = `recovery.admin.${run}@example.com`;
    await db.execute('INSERT INTO ADMIN (Name, Email, Password) VALUES (?, ?, ?)', ['Test Admin', email, await bcrypt.hash('RecoveryTest123!', 4)]);
    const admin = (await call('POST', '/api/admin/login', null, { email, password: 'RecoveryTest123!' })).token;
    const student = async (name) => {
      const email = `recovery.${name}.${run}@example.com`;
      await call('POST', '/api/students/register', null, { name, email, password: 'RecoveryTest123!' }, 201);
      return call('POST', '/api/students/login', null, { email, password: 'RecoveryTest123!' });
    };
    const owner = await student('owner'), finder = await student('finder'), other = await student('other');
    await call('GET', '/api/lost-items', null, undefined, 401);
    await call('GET', '/api/found-items', null, undefined, 401);
    await call('GET', '/api/matches', null, undefined, 401);
    const stats = await call('GET', '/api/stats');
    assert.equal(typeof stats.totalReports, 'number');
    await call('PUT', '/api/students/me', owner.token, { name: 'Updated Owner', phone: '123', year: 3 });
    await call('PUT', '/api/students/me', owner.token, { year: 99 }, 400);
    const lost = await call('POST', '/api/lost-items', owner.token, { itemName: 'Recovery blue notebook', category: 'Stationery' }, 201);
    const found = await call('POST', '/api/found-items', finder.token, { itemName: 'Recovery blue notebook', category: 'Stationery' }, 201);
    await call('POST', '/api/claims', owner.token, { foundId: found.FoundID }, 409);
    assert.deepEqual(await call('GET', `/api/matches/candidates/${lost.LostID}`, owner.token), []);
    await call('PUT', `/api/admin/lost/${lost.LostID}/verify`, admin);
    await call('PUT', `/api/admin/found/${found.FoundID}/verify`, admin);
    const [records] = await db.execute("SELECT MatchID FROM MATCH_RECORD WHERE LostID = ? AND FoundID = ?", [lost.LostID, found.FoundID]);
    let matchId = records[0]?.MatchID;
    if (!matchId) {
      const [result] = await db.execute("INSERT INTO MATCH_RECORD (LostID, FoundID) VALUES (?, ?)", [lost.LostID, found.FoundID]); matchId = result.insertId;
    }
    await call('PATCH', `/api/matches/${matchId}/status`, finder.token, { status: 'Confirmed' }, 403);
    await call('PATCH', `/api/matches/${matchId}/status`, owner.token, { status: 'Confirmed' });
    assert.deepEqual(await call('GET', '/api/matches', other.token), []);
    await call('POST', '/api/claims', finder.token, { foundId: found.FoundID }, 409);
    await call('POST', '/api/claims', other.token, { foundId: found.FoundID, lostId: lost.LostID }, 403);
    const competitor = (await call('POST', '/api/claims', other.token, { foundId: found.FoundID }, 201)).claim;
    const claim = (await call('POST', '/api/claims', owner.token, { foundId: found.FoundID, lostId: lost.LostID }, 201)).claim;
    await call('POST', '/api/claims', owner.token, { foundId: found.FoundID }, 409);
    await call('PUT', `/api/claims/${claim.ClaimID}/notes`, owner.token, { verificationNotes: 'not admin' }, 403);
    await call('PUT', `/api/claims/${claim.ClaimID}/notes`, admin, { verificationNotes: 'ID checked' });
    let claims = await call('GET', `/api/claims/student/${owner.student.StudentID}`, owner.token);
    assert.equal(claims.find((c) => c.ClaimID === claim.ClaimID).VerificationNotes, 'ID checked');
    await call('PUT', `/api/claims/${claim.ClaimID}/status`, admin, { claimStatus: 'Approved' });
    assert.equal((await call('GET', `/api/lost-items/${lost.LostID}`, owner.token)).Status, 'Matched');
    assert.equal((await call('GET', `/api/found-items/${found.FoundID}`, owner.token)).Status, 'Claimed');
    claims = await call('GET', `/api/claims/student/${other.student.StudentID}`, other.token);
    assert.equal(claims.find((c) => c.ClaimID === competitor.ClaimID).ClaimStatus, 'Rejected');
    await call('PUT', `/api/claims/${claim.ClaimID}/status`, admin, { claimStatus: 'Rejected' }, 409);
    await call('PUT', `/api/claims/${competitor.ClaimID}/status`, admin, { claimStatus: 'Approved' }, 409);
    await call('PUT', `/api/claims/${claim.ClaimID}/notes`, admin, { verificationNotes: 'late' }, 409);
    await call('POST', '/api/claims', other.token, { foundId: found.FoundID }, 409);
    await call('PUT', `/api/admin/found/${found.FoundID}/return`, admin);
    await call('PUT', `/api/admin/found/${found.FoundID}/return`, admin, undefined, 409);
    assert.equal((await call('GET', `/api/lost-items/${lost.LostID}`, owner.token)).Status, 'Closed');
    const notices = await call('GET', `/api/notifications/student/${owner.student.StudentID}`, owner.token);
    assert.ok(notices.some((n) => n.Message.includes('collected')));
    await call('POST', '/api/claims', owner.token, { foundId: found.FoundID }, 409);
    // A direct claim links its report without needing a confirmed match.
    const directLost = await call('POST', '/api/lost-items', owner.token, { itemName: 'Direct claim report' }, 201);
    const directFound = await call('POST', '/api/found-items', finder.token, { itemName: 'Direct found' }, 201);
    await call('PUT', `/api/admin/lost/${directLost.LostID}/verify`, admin);
    await call('PUT', `/api/admin/found/${directFound.FoundID}/verify`, admin);
    const direct = (await call('POST', '/api/claims', owner.token, { foundId: directFound.FoundID, lostId: directLost.LostID }, 201)).claim;
    await call('PUT', `/api/claims/${direct.ClaimID}/status`, admin, { claimStatus: 'Approved' });
    await call('PATCH', `/api/lost-items/${directLost.LostID}`, owner.token, { action: 'close' }, 409);
    await call('PUT', `/api/admin/found/${directFound.FoundID}/return`, admin);
    assert.equal((await call('GET', `/api/lost-items/${directLost.LostID}`, owner.token)).Status, 'Closed');
    // Editing requires ownership, invalidates verification; closure is terminal.
    const editable = await call('POST', '/api/lost-items', owner.token, { itemName: 'Editable' }, 201);
    await call('PUT', `/api/admin/lost/${editable.LostID}/verify`, admin);
    await call('PATCH', `/api/lost-items/${editable.LostID}`, other.token, { itemName: 'Forged' }, 403);
    const edited = await call('PATCH', `/api/lost-items/${editable.LostID}`, owner.token, { itemName: 'Edited' });
    assert.equal(edited.AdminID, null);
    await call('PATCH', `/api/lost-items/${editable.LostID}`, owner.token, { action: 'close' });
    await call('PATCH', `/api/lost-items/${editable.LostID}`, owner.token, { itemName: 'Reopen' }, 409);
    const withdraw = await call('POST', '/api/found-items', finder.token, { itemName: 'Withdraw' }, 201);
    await call('PATCH', `/api/found-items/${withdraw.FoundID}`, finder.token, { action: 'close' });
    // Concurrent approvals serialize on the found item: exactly one winner.
    const raceItem = await call('POST', '/api/found-items', finder.token, { itemName: 'Concurrent claims' }, 201);
    await call('PUT', `/api/admin/found/${raceItem.FoundID}/verify`, admin);
    const raceA = (await call('POST', '/api/claims', owner.token, { foundId: raceItem.FoundID }, 201)).claim;
    const raceB = (await call('POST', '/api/claims', other.token, { foundId: raceItem.FoundID }, 201)).claim;
    const races = await Promise.all([raceA, raceB].map((c) => fetch(process.env.RECOVERY_TEST_URL + `/api/claims/${c.ClaimID}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${admin}` }, body: JSON.stringify({ claimStatus: 'Approved' }) })));
    assert.deepEqual(races.map((r) => r.status).sort(), [200, 409]);
    checks += 2;
    console.log(`Recovery integration: ${checks} HTTP checks passed, plus lifecycle and notification assertions.`);
  } finally { await db.end(); }
}
main().catch((err) => { console.error(err); process.exitCode = 1; });
