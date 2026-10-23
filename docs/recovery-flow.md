# Recovery lifecycle

Reports require security verification before matching or ownership claims. Verification records the administrator; it does not prove ownership or record pickup.

1. A student files a lost/found report. Security verifies it; verified open reports enter matching.
2. The lost reporter confirms a suggested match and files an ownership claim. A direct claim can optionally link one of the claimant's verified active lost reports.
3. Security can save notes on pending claims independently of the decision. Cancel discards unsaved text.
4. Approval reserves the found item (`Claimed`) and linked lost report (`Matched`). Other pending claims on that found item are rejected and their claimants notified. Decisions are final through this API.
5. Physical handover is a separate admin action: Mark as Returned. It changes the found item to `Returned`, closes the approved claimant's linked lost report, and notifies them that collection is complete.

A claim without a related lost report is valid. No unrelated report is closed automatically. For existing confirmed matches, claim creation infers the claimant's related report when omitted.

## Database migration

Before deploying this version to an existing database, back it up and run once:

```sh
node scripts/run-sql.js sql/migrations/002_recovery_flow.sql
```

The runner uses `DB_NAME` from `.env`. The migration adds nullable `CLAIM.LostID`, backfills confirmed links, restores legacy approved-but-not-collected reports to `Matched`, resolves legacy competing pending claims, and adds `Closed` to the found-report status enum. Fresh installations use `sql/schema.sql` instead. No migration is run automatically at startup.

## API changes

- `GET /api/stats` is public and returns aggregate report, match, verification, and return counts.
- Item and match reads require authentication. Per-student report lists require that student or an admin. Match reads are scoped to participating reporters or admins; candidate reads require the lost reporter or an admin. Authenticated campus users can browse item details; anonymous visitors receive aggregate counts only.
- `POST /api/claims` accepts `{ foundId, lostId? }`. It requires a verified available found item and rejects self-claims, duplicate pending claims, and invalid report links.
- `PUT /api/claims/:id/notes` accepts `{ verificationNotes }`; admin only, pending claims only, up to 5000 characters.
- `PUT /api/claims/:id/status` accepts Approved/Rejected, only while Pending. Approval and notices are transactional. Repeated or stale decisions return 409.
- `PUT /api/admin/found/:id/return` records collection; admin only, Claimed items only. Repeated handover returns 409.
- `PATCH /api/lost-items/:id` and `PATCH /api/found-items/:id` let the reporting student edit open reports or close them with `{ action: 'close' }`. Editing requires re-verification. Active claims and confirmed matches block edits/withdrawal; security must resolve those first. Closing stops matching without deleting report history.
- Profile uses existing `GET/PUT /api/students/me`. Students can edit name, phone, department, year, and hostel; email/password are unchanged.

The frontend uses hash routes for refreshable pages and browser back/forward. Photo-upload retries retain the created report ID, so retries do not create duplicate reports.

## Validation

Run `npm run build` and `npm run lint` inside `frontend/`. The production chunk-size warning is pre-existing.

The existing `npm run smoke` tests the verified match, claim, and collection flow against a running backend. It creates and removes its own fixtures.

Additional regression tests require an explicitly disposable database whose name ends in `_test`, with the current schema and a backend pointing at it:

```sh
DB_HOST=127.0.0.1 DB_PORT=3306 DB_USER=root DB_PASSWORD=... \
DB_NAME=campusfind_recovery_test RECOVERY_TEST_URL=http://127.0.0.1:5000 \
node scripts/test-recovery.js
```

These tests leave fixtures in the disposable database for browser inspection. They cover verification gates, ownership boundaries, notes, competing claims, final decisions, direct claims, pickup notifications, report editing and closure, and unavailable-item claims. Never point them at a shared or production database.
