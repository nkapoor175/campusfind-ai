// End-to-end smoke test for the running backend.
//
// Usage:  npm run smoke              run the whole flow, then delete everything it created
//         npm run smoke -- --keep    run the whole flow and LEAVE the data in place (for demos)
//
// Needs: the backend running (npm start) and the seeded demo admin (admin@campus.edu, see sql/seed.sql).
// Override the admin login with SMOKE_ADMIN_EMAIL / SMOKE_ADMIN_PASSWORD, the server with SMOKE_BASE_URL.
// The text and image services are optional; the backend falls back to its built-in scorer.
// Everything is checked through the HTTP API; the database is only touched at the end to clean up.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mysql = require('mysql2/promise');

const BASE_URL = process.env.SMOKE_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
const ADMIN_EMAIL = process.env.SMOKE_ADMIN_EMAIL || 'admin@campus.edu';
const ADMIN_PASSWORD = process.env.SMOKE_ADMIN_PASSWORD || 'Admin@12345';
const PASSWORD = 'Smoke@12345';
const KEEP = process.argv.includes('--keep');

const runId = Date.now();
const created = { studentIds: [], lostIds: [], foundIds: [] };
let passed = 0;
let failed = 0;

function check(name, condition, detail = '') {
    if (condition) {
        passed += 1;
        console.log(`PASS  ${name}${detail ? `  (${detail})` : ''}`);
    } else {
        failed += 1;
        console.log(`FAIL  ${name}${detail ? `  (${detail})` : ''}`);
    }
    return condition;
}

async function call(method, path, body, token) {
    const res = await fetch(BASE_URL + path, {
        method,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: body ? JSON.stringify(body) : undefined
    });
    let data = null;
    try { data = await res.json(); } catch (err) { /* empty body */ }
    return { status: res.status, data };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(fn, timeoutMs = 15000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const value = await fn();
        if (value) return value;
        await sleep(250);
    }
    return null;
}

async function cleanup() {
    const { studentIds, lostIds, foundIds } = created;
    if (studentIds.length === 0 && lostIds.length === 0 && foundIds.length === 0) return;

    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    try {
        // `IN (?)` needs a non-empty list, so use [0] (matches nothing) when a list is empty
        const students = studentIds.length ? studentIds : [0];
        const lost = lostIds.length ? lostIds : [0];
        const found = foundIds.length ? foundIds : [0];

        await conn.query(
            `DELETE FROM NOTIFICATION
             WHERE StudentID IN (?)
                OR MatchID IN (SELECT MatchID FROM MATCH_RECORD WHERE LostID IN (?) OR FoundID IN (?))`,
            [students, lost, found]
        );
        await conn.query('DELETE FROM CLAIM WHERE StudentID IN (?) OR FoundID IN (?)', [students, found]);
        await conn.query('DELETE FROM MATCH_RECORD WHERE LostID IN (?) OR FoundID IN (?)', [lost, found]);
        await conn.query('DELETE FROM LOST_ITEM WHERE LostID IN (?)', [lost]);     // image rows cascade
        await conn.query('DELETE FROM FOUND_ITEM WHERE FoundID IN (?)', [found]);
        await conn.query('DELETE FROM STUDENT WHERE StudentID IN (?)', [students]);
        console.log('\nCleanup: removed the test users, items, matches, claims and notifications.');
    } finally {
        await conn.end();
    }
}

async function main() {
    console.log(`Smoke test against ${BASE_URL}${KEEP ? '  (--keep: data will be left in place)' : ''}\n`);

    // 1. health
    let health;
    try {
        health = await call('GET', '/health');
    } catch (err) {
        console.error(`Cannot reach ${BASE_URL}. Is the backend running (npm start)?`);
        process.exit(1);
    }
    check('GET /health reports the database connected', health.status === 200 && health.data.db === 'connected');
    if (health.status !== 200) return;

    // 2. register / login / me
    const people = {
        owner: { name: 'Smoke Lost Owner', email: `smoke.lost.${runId}@example.com` },
        finder: { name: 'Smoke Finder', email: `smoke.found.${runId}@example.com` }
    };
    for (const person of Object.values(people)) {
        const reg = await call('POST', '/api/students/register', {
            name: person.name, email: person.email, password: PASSWORD, department: 'CSE', year: 3, hostel: 'Smoke Hostel'
        });
        check(`register ${person.email}`, reg.status === 201 && !('Password' in reg.data), `StudentID ${reg.data && reg.data.StudentID}`);
        person.id = reg.data && reg.data.StudentID;
        if (person.id) created.studentIds.push(person.id);

        const login = await call('POST', '/api/students/login', { email: person.email, password: PASSWORD });
        check(`login ${person.email}`, login.status === 200 && !!login.data.token);
        person.token = login.data && login.data.token;

        const me = await call('GET', '/api/students/me', null, person.token);
        check(`GET /me returns the logged-in student ${person.email}`, me.status === 200 && me.data.Email === person.email && !('Password' in me.data));
    }
    const wrong = await call('POST', '/api/students/login', { email: people.owner.email, password: 'wrong-password' });
    check('login with a wrong password returns 401', wrong.status === 401);
    if (!people.owner.token || !people.finder.token) return;

    // 2b. edit own profile (only name/phone/department/year/hostel; email and password are ignored)
    const renamed = `Smoke Owner ${runId}`;
    const edit = await call('PUT', '/api/students/me',
        { name: renamed, hostel: 'Smoke Hostel 2', email: 'ignored@example.com', password: 'ignored' }, people.owner.token);
    check('edit own profile (email and password in the body are ignored)',
        edit.status === 200 && edit.data.Name === renamed && edit.data.Hostel === 'Smoke Hostel 2'
        && edit.data.Email === people.owner.email && !('Password' in edit.data));
    check('editing the profile with an invalid year returns 400',
        (await call('PUT', '/api/students/me', { year: 99 }, people.owner.token)).status === 400);

    // 3. admin login
    const adminLogin = await call('POST', '/api/admin/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    check(`admin login (${ADMIN_EMAIL})`, adminLogin.status === 200 && !!adminLogin.data.token,
        adminLogin.status !== 200 ? `status ${adminLogin.status}: ${JSON.stringify(adminLogin.data)}. Is the demo admin seeded with a password? See README.` : '');
    const adminToken = adminLogin.data && adminLogin.data.token;
    if (!adminToken) return;
    const adminWrong = await call('POST', '/api/admin/login', { email: ADMIN_EMAIL, password: 'wrong-password' });
    check('admin login with a wrong password returns 401', adminWrong.status === 401);

    // 4. report a lost and a found item (descriptions chosen to match each other)
    const lostRes = await call('POST', '/api/lost-items', {
        itemName: `Smoke ${runId} black boAt earbuds`, category: 'Electronics', brand: 'boAt', color: 'Black',
        description: 'Black boAt earbuds', lostLocation: 'Library'
    }, people.owner.token);
    check('create lost item (201, Status Open)', lostRes.status === 201 && lostRes.data.Status === 'Open', `LostID ${lostRes.data && lostRes.data.LostID}`);
    const lost = lostRes.data;
    if (lost && lost.LostID) created.lostIds.push(lost.LostID);

    const foundRes = await call('POST', '/api/found-items', {
        itemName: `Smoke ${runId} boAt Airdopes earbuds`, category: 'Electronics', brand: 'boAt', color: 'Black',
        description: 'boAt Airdopes earbuds black', foundLocation: 'Canteen'
    }, people.finder.token);
    check('create found item (201, Status Open)', foundRes.status === 201 && foundRes.data.Status === 'Open', `FoundID ${foundRes.data && foundRes.data.FoundID}`);
    const found = foundRes.data;
    if (found && found.FoundID) created.foundIds.push(found.FoundID);
    if (!lost || !found || !lost.LostID || !found.FoundID) return;

    // 5. admin: pending list and verification need an admin token
    check('admin pending without a token returns 401', (await call('GET', '/api/admin/pending')).status === 401);
    check('admin pending with a student token returns 403', (await call('GET', '/api/admin/pending', null, people.owner.token)).status === 403);
    const pending = await call('GET', '/api/admin/pending', null, adminToken);
    check('admin pending lists both new reports',
        pending.status === 200
        && pending.data.lostItems.some((i) => i.LostID === lost.LostID)
        && pending.data.foundItems.some((i) => i.FoundID === found.FoundID));
    const verifyLost = await call('PUT', `/api/admin/lost/${lost.LostID}/verify`, null, adminToken);
    check('admin verifies the lost item', verifyLost.status === 200, verifyLost.status !== 200 ? `status ${verifyLost.status}: ${JSON.stringify(verifyLost.data)}` : '');
    const verifyFound = await call('PUT', `/api/admin/found/${found.FoundID}/verify`, null, adminToken);
    check('admin verifies the found item', verifyFound.status === 200, verifyFound.status !== 200 ? `status ${verifyFound.status}: ${JSON.stringify(verifyFound.data)}` : '');
    const pendingAfter = await call('GET', '/api/admin/pending', null, adminToken);
    check('verified reports leave the pending list',
        pendingAfter.status === 200
        && !pendingAfter.data.lostItems.some((i) => i.LostID === lost.LostID)
        && !pendingAfter.data.foundItems.some((i) => i.FoundID === found.FoundID));

    // 6. candidates (live scores)
    const candidates = await call('GET', `/api/matches/candidates/${lost.LostID}`);
    const entry = candidates.status === 200 && candidates.data.find((c) => c.foundItem.FoundID === found.FoundID);
    check('candidates lists the found item with a score', !!entry && typeof entry.score === 'number' && entry.score > 0,
        entry ? `score ${entry.score}, text ${entry.textScore}, image ${entry.imageScore}` : '');

    // 7. automatic matching created a Pending match
    const match = await waitFor(async () => {
        const all = await call('GET', '/api/matches');
        return all.status === 200 && all.data.find((m) => m.LostID === lost.LostID && m.FoundID === found.FoundID);
    });
    check('auto-match created a Pending match', !!match && match.MatchStatus === 'Pending', match ? `MatchID ${match.MatchID}` : 'none appeared within 15s');
    if (!match) return;

    // 8. confirm the match (only the lost item's owner or an admin may): statuses and notifications
    const finderConfirm = await call('PATCH', `/api/matches/${match.MatchID}/status`, { status: 'Confirmed' }, people.finder.token);
    check('the finder cannot confirm the match (403)', finderConfirm.status === 403);
    const confirm = await call('PATCH', `/api/matches/${match.MatchID}/status`, { status: 'Confirmed' }, people.owner.token);
    check('the lost owner confirms the match', confirm.status === 200 && confirm.data.MatchStatus === 'Confirmed');
    const lostAfterConfirm = await call('GET', `/api/lost-items/${lost.LostID}`);
    check('lost item is now Matched', lostAfterConfirm.data.Status === 'Matched');
    const ownerNotes = await call('GET', `/api/notifications/student/${people.owner.id}`, null, people.owner.token);
    const finderNotes = await call('GET', `/api/notifications/student/${people.finder.id}`, null, people.finder.token);
    check('lost owner has a notification for the confirmed match',
        ownerNotes.status === 200 && ownerNotes.data.some((n) => n.MatchID === match.MatchID && /confirmed match/.test(n.Message)));
    check('finder has a notification for the confirmed match',
        finderNotes.status === 200 && finderNotes.data.some((n) => n.MatchID === match.MatchID && /was confirmed/.test(n.Message)));
    check('a student cannot read another student\'s notifications (403)',
        (await call('GET', `/api/notifications/student/${people.finder.id}`, null, people.owner.token)).status === 403);

    // 9. claim and approve (the claimant comes from the token, the deciding admin from the admin token)
    check('filing a claim without a token returns 401', (await call('POST', '/api/claims', { foundId: found.FoundID })).status === 401);
    const claim = await call('POST', '/api/claims', { foundId: found.FoundID }, people.owner.token);
    check('lost owner files a claim on the found item', claim.status === 201 && claim.data.claim.StudentID === people.owner.id,
        `ClaimID ${claim.data && claim.data.claim && claim.data.claim.ClaimID}`);
    if (claim.status !== 201) return;
    const claimId = claim.data.claim.ClaimID;

    // claim lists are private: students see their own claims, the reporter sees the claims on their item
    check('listing a student\'s claims without a token returns 401', (await call('GET', `/api/claims/student/${people.owner.id}`)).status === 401);
    check('a student cannot list another student\'s claims (403)',
        (await call('GET', `/api/claims/student/${people.owner.id}`, null, people.finder.token)).status === 403);
    const ownClaims = await call('GET', `/api/claims/student/${people.owner.id}`, null, people.owner.token);
    check('a student lists their own claims', ownClaims.status === 200 && ownClaims.data.some((x) => x.ClaimID === claimId));
    check('listing the claims on a found item without a token returns 401', (await call('GET', `/api/claims/found/${found.FoundID}`)).status === 401);
    check('the claimant cannot list the claims on someone else\'s found item (403)',
        (await call('GET', `/api/claims/found/${found.FoundID}`, null, people.owner.token)).status === 403);
    const itemClaims = await call('GET', `/api/claims/found/${found.FoundID}`, null, people.finder.token);
    check('the finder lists the claims on their found item', itemClaims.status === 200 && itemClaims.data.some((x) => x.ClaimID === claimId));
    const adminItemClaims = await call('GET', `/api/claims/found/${found.FoundID}`, null, adminToken);
    const adminStudentClaims = await call('GET', `/api/claims/student/${people.owner.id}`, null, adminToken);
    check('an admin can list claims by student and by found item', adminItemClaims.status === 200 && adminStudentClaims.status === 200);
    check('a student cannot approve a claim (403)',
        (await call('PUT', `/api/claims/${claimId}/status`, { claimStatus: 'Approved' }, people.owner.token)).status === 403);
    const approve = await call('PUT', `/api/claims/${claimId}/status`, { claimStatus: 'Approved', verificationNotes: 'smoke test' }, adminToken);
    check('admin approves the claim', approve.status === 200 && approve.data.claim.ClaimStatus === 'Approved');
    const foundAfter = await call('GET', `/api/found-items/${found.FoundID}`);
    const lostAfter = await call('GET', `/api/lost-items/${lost.LostID}`);
    check('found item is now Claimed', foundAfter.data.Status === 'Claimed');
    check('lost item is now Closed', lostAfter.data.Status === 'Closed');
    const ownerNotesAfter = await call('GET', `/api/notifications/student/${people.owner.id}`, null, people.owner.token);
    check('claimant is notified the claim was approved',
        ownerNotesAfter.status === 200 && ownerNotesAfter.data.some((n) => n.MatchID === null && /was approved/.test(n.Message)));
    const approveAgain = await call('PUT', `/api/claims/${claimId}/status`, { claimStatus: 'Approved' }, adminToken);
    check('approving the same item twice returns 409', approveAgain.status === 409);

    // 10. admin: list all claims, then mark the claimed item as returned
    check('listing all claims without a token returns 401', (await call('GET', '/api/claims')).status === 401);
    check('listing all claims with a student token returns 403', (await call('GET', '/api/claims', null, people.owner.token)).status === 403);
    const allClaims = await call('GET', '/api/claims', null, adminToken);
    const listed = allClaims.status === 200 && allClaims.data.find((x) => x.ClaimID === claimId);
    check('admin lists all claims with the student and item names',
        !!listed && listed.StudentName === renamed && listed.FoundItemName === found.ItemName,
        listed ? `${listed.StudentName} / ${listed.FoundItemName}` : '');
    check('a student cannot mark an item returned (403)',
        (await call('PUT', `/api/admin/found/${found.FoundID}/return`, null, people.owner.token)).status === 403);
    const returned = await call('PUT', `/api/admin/found/${found.FoundID}/return`, null, adminToken);
    check('admin marks the claimed found item Returned', returned.status === 200 && returned.data.item.Status === 'Returned');
    check('marking it Returned twice returns 409',
        (await call('PUT', `/api/admin/found/${found.FoundID}/return`, null, adminToken)).status === 409);

    // 11. admin removes spam reports (the one deliberate hard delete)
    const spamLost = await call('POST', '/api/lost-items',
        { itemName: `Smoke ${runId} spam lost`, category: 'Misc', description: 'zzzalpha' }, people.owner.token);
    const spamFound = await call('POST', '/api/found-items',
        { itemName: `Smoke ${runId} spam found`, category: 'Other', description: 'qqqbeta' }, people.finder.token);
    if (spamLost.status === 201) created.lostIds.push(spamLost.data.LostID);
    if (spamFound.status === 201) created.foundIds.push(spamFound.data.FoundID);
    if (spamLost.status === 201 && spamFound.status === 201) {
        const spamLostId = spamLost.data.LostID;
        const spamFoundId = spamFound.data.FoundID;
        check('a student cannot delete a report (403)',
            (await call('DELETE', `/api/admin/lost/${spamLostId}`, null, people.owner.token)).status === 403);
        check('deleting a report without a token returns 401', (await call('DELETE', `/api/admin/found/${spamFoundId}`)).status === 401);
        const delLost = await call('DELETE', `/api/admin/lost/${spamLostId}`, null, adminToken);
        check('admin removes the spam lost report', delLost.status === 200 && delLost.data.removed.matches === 0);
        const delFound = await call('DELETE', `/api/admin/found/${spamFoundId}`, null, adminToken);
        check('admin removes the spam found report', delFound.status === 200 && delFound.data.removed.claims === 0);
        check('removed reports are gone (404)',
            (await call('GET', `/api/lost-items/${spamLostId}`)).status === 404
            && (await call('GET', `/api/found-items/${spamFoundId}`)).status === 404);
    } else {
        check('create the spam reports for the removal check', false, `lost ${spamLost.status}, found ${spamFound.status}`);
    }

    if (KEEP) {
        console.log('\n--keep: data left in place for your demo.');
        console.log(`  Lost owner: ${people.owner.email}  (StudentID ${people.owner.id})`);
        console.log(`  Finder:     ${people.finder.email}  (StudentID ${people.finder.id})`);
        console.log(`  Password for both: ${PASSWORD}`);
        console.log(`  Admin login: ${ADMIN_EMAIL}`);
        console.log(`  Lost item ${lost.LostID}, found item ${found.FoundID}, match ${match.MatchID}, claim ${claimId}`);
    }
}

main()
    .catch((err) => {
        failed += 1;
        console.log(`FAIL  unexpected error: ${err.message}`);
    })
    .finally(async () => {
        if (!KEEP) {
            try {
                await cleanup();
            } catch (err) {
                console.log(`\nWARNING: cleanup failed (${err.message}). Test rows named "Smoke ${runId}" may remain.`);
            }
        }
        console.log(`\n${passed} passed, ${failed} failed`);
        process.exit(failed === 0 ? 0 : 1);
    });
