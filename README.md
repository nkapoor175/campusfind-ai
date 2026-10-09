# CampusFind AI — Backend

DBMS mini project: a structured lost & found platform for a college campus, with an AI matching layer that compares lost/found reports and surfaces likely matches. AI is a process, not a database entity — it reads item data and returns match scores; scores are never stored (see `MATCH_RECORD` in the schema).

This project implements the complete CampusFind AI backend, covering student authentication, lost and found item management, match calculation, admin verification, claim handling, notification delivery, image upload endpoints, and a separate image-similarity microservice.

## Architecture

- **Node.js + Express + MySQL** (`mysql2`, raw parameterized queries, no ORM) — core backend for student authentication, item CRUD, and business logic.
- **Python text-similarity service** under `python-service/` — text similarity matching microservice; Node calls it over HTTP with a timeout, falling back to a local stub scorer if unreachable.
- **Separate Python FastAPI Image Similarity service** under `ml-service/` — standalone image feature extraction and cosine similarity microservice.
- **Postman collection** under `postman/` — collection covering all API requests across the system.

## Setup

You need Node.js 18 or newer (the backend uses the built-in `fetch`), a MySQL 8 database, and optionally Python 3.11 or 3.12 for the two AI services.

### 1. Install and configure

```bash
npm install
cp .env.example .env      # PowerShell: Copy-Item .env.example .env
```

Then edit `.env` and set the database values (see [Database host](#database-host) below) and a long random `JWT_SECRET`. `.env` is gitignored; never commit it.

### 2. Database

No `mysql` command-line client is needed. The repo includes a small runner that uses the credentials in `.env`:

```bash
node scripts/run-sql.js sql/schema.sql
node scripts/run-sql.js sql/seed.sql
```

This creates the `campusfind_ai` database with all 9 tables and loads a small starter dataset (3 students, 1 admin, 2 lost items, 2 found items, 2 pending matches). For the full demo dataset with working logins, photos, claims and notifications, run `npm run demo:reset` instead (see [Demo](#demo)).

> **`schema.sql` drops and recreates every table.** `run-sql.js` therefore refuses to run any file containing `DROP TABLE` against a database that already has rows, and lists the tables that would be wiped. Pass `--allow-drop` only if you really want that data gone. Schema changes for a database that already has data go in `sql/migrations/` instead.

> Seed passwords are plain placeholder strings, not bcrypt hashes, so **seeded students cannot log in**. They exist to populate foreign keys for testing. Create real accounts with `POST /api/students/register`, which hashes passwords with bcrypt. The exception is the seeded admin (`AdminID 1`): it has a real bcrypt hash so you can log in at `POST /api/admin/login` as `admin@campus.edu` / `Admin@12345`.

**Upgrading a database that already has data** (for example one created before admins could log in): do not re-run `schema.sql`. Apply the migration, then give the admin a password:

```bash
node scripts/run-sql.js sql/migrations/001_admin_password.sql
node scripts/set-admin-password.js admin@campus.edu Admin@12345
```

The migration adds `ADMIN.Password` and is safe to run more than once.

### Database host

The backend only needs the five `DB_*` values in `.env`, so it runs against any MySQL 8 server. For a demo, use MySQL on the same computer: install MySQL 8, start it, then set `DB_HOST=127.0.0.1`, `DB_PORT=3306`, your `DB_USER` / `DB_PASSWORD`, and `DB_NAME=campusfind_ai`.

A hosted MySQL works too if you point the same values at it, with two limits: `schema.sql` creates and uses a database called `campusfind_ai`, so the account must be allowed to create it, and the backend does not support providers that only accept TLS connections. Moving to another server is a `.env` change plus running the two SQL files there.

### 3. Start the backend

```bash
npm start
```

Confirm the server is up by opening http://localhost:5000/health in a browser (in PowerShell, `curl` is an alias for something else; use `Invoke-RestMethod http://localhost:5000/health`). It should return `{"status":"ok","db":"connected"}`.

### 4. Python text-similarity service (optional) — port 8000

Use Python 3.11 or 3.12 (the pinned packages and PyTorch don't have builds for 3.14 yet). On Windows PowerShell:

```powershell
cd python-service
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --port 8000
```

If this service isn't running, the Node match endpoints automatically fall back to a local weighted string-comparison scorer — nothing breaks, matching just gets less accurate.

### 5. Image Similarity service (optional) — port 8001

The Image Similarity service is a separate FastAPI service located in `ml-service/`. It runs on **8001** so it doesn't clash with the text service on 8000:

```powershell
cd ml-service
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8001
```

`GET http://localhost:8001/health` reports which engine is active (`PyTorch MobileNetV3`, or `NumPy/PIL Feature Extractor` if PyTorch isn't installed).

### 6. Run everything (3 terminals)

Make sure MySQL is running first, then:

| Terminal | Folder | Command | Port |
|---|---|---|---|
| 1 | repo root | `npm start` | 5000 |
| 2 | `python-service/` | `.\.venv\Scripts\python.exe -m uvicorn main:app --port 8000` | 8000 |
| 3 | `ml-service/` | `.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8001` | 8001 |

Terminals 2 and 3 are optional: the backend works without them. Without the text service it uses the built-in string scorer; without the image service it scores on text only.

### 7. Smoke test

With the backend running (and ideally both Python services), run the whole flow end to end:

```bash
npm run smoke
```

It registers two fresh users, logs in as the demo admin, reports a lost and a found item, has the admin verify them, checks candidate scores, waits for the automatic match, confirms it, files and approves a claim, and checks every status and notification along the way, including that the wrong role or the wrong student is refused (`401` / `403`). It also edits a profile, lists all claims as admin, marks the item returned, and removes a spam report. Each check prints `PASS` or `FAIL`; the exit code is non-zero if anything fails. By default it deletes everything it created. To leave the data in place for a demo (it prints the two test logins), run:

```bash
npm run smoke -- --keep
```

It expects the demo admin (`admin@campus.edu` / `Admin@12345`, see [Authentication](#authentication)); set `SMOKE_ADMIN_EMAIL`, `SMOKE_ADMIN_PASSWORD` or `SMOKE_BASE_URL` in the environment to override the admin login or server address.

## Environment Variables

### Backend (`.env`)

Defined in `.env.example`:

| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | Port for the Node.js Express server | `5000` |
| `DB_HOST` | MySQL database host | `localhost` |
| `DB_PORT` | MySQL database port | `3306` |
| `DB_USER` | MySQL database user | `root` |
| `DB_PASSWORD` | MySQL database password | *(empty)* |
| `DB_NAME` | MySQL database name | `campusfind_ai` |
| `JWT_SECRET` | Secret key used to sign and verify JSON Web Tokens | `replace_with_a_long_random_string` |
| `TEXT_SIMILARITY_URL` | URL of the Python text similarity microservice | `http://localhost:8000/similarity` |
| `ML_SIMILARITY_URL` | Base URL of the Python image similarity microservice | `http://localhost:8001` |
| `AUTO_MATCH_THRESHOLD` | Minimum score (0 to 1) for a pair to get an automatic Pending match | `0.7` |
| `ML_TIMEOUT_MS` | How long to wait for the image service before ignoring photos for that comparison | `8000` |
| `IMAGE_WEIGHT` | Weight of the photo score in the final score when both items have a photo (0 to 1) | `0.4` |

### Postman Variables

Configured in the Postman collection:

| Variable | Description | Value |
|---|---|---|
| `baseUrl` | Base URL for the Node.js backend | `http://localhost:5000` |
| `mlUrl` | Base URL for the separate Image Similarity service | `http://localhost:8001` |
| `authToken` | Student JWT, saved by **Login Student** | *(dynamically set)* |
| `adminToken` | Admin JWT, saved by **Admin Login** | *(dynamically set)* |

## Authentication

Authentication is handled via JWT bearer tokens (`Authorization: Bearer <token>`). There are two roles:

| Role | How to get a token | Token contents | Lifetime |
|---|---|---|---|
| **Student** | `POST /api/students/login` | `{ studentId, role: "student" }` | 7 days |
| **Admin** | `POST /api/admin/login` with an admin's email and password | `{ adminId, role: "admin" }` | 12 hours |

Admin passwords are stored as bcrypt hashes in `ADMIN.Password`. The demo admin from `sql/seed.sql` is `admin@campus.edu` / `Admin@12345`; change it with `node scripts/set-admin-password.js admin@campus.edu <new-password>` for anything beyond a demo.

### Who can call what

| Access | Endpoints |
|---|---|
| **Public** | `GET /health`, `POST /api/students/register`, `POST /api/students/login`, `POST /api/admin/login`, all `GET` lost/found item routes, `GET /api/matches*` (including `/candidates/:lostId`), `GET /api/uploads/*`, and the static `/uploads/*` photos |
| **Student token only** | `GET /api/students/me`, `PUT /api/students/me`, `POST /api/lost-items`, `POST /api/found-items`, `POST /api/claims` |
| **Any valid token** | `POST /api/matches` |
| **Owner or admin** | `PATCH /api/matches/:id/status` (the lost item's owner), `POST /api/uploads/lost/:lostId` and `POST /api/uploads/found/:foundId` (the student who reported that item), `GET /api/notifications/student/:studentId` and `PUT /api/notifications/:id/read` (the notification's own student), `GET /api/claims/student/:studentId` (that student), `GET /api/claims/found/:foundId` (the student who reported that found item) |
| **Admin token only** | `GET /api/admin/pending`, `PUT /api/admin/lost/:id/verify`, `PUT /api/admin/found/:id/verify`, `PUT /api/admin/found/:id/return`, `DELETE /api/admin/lost/:id`, `DELETE /api/admin/found/:id`, `GET /api/claims`, `PUT /api/claims/:id/status` |

Responses: no or invalid token is `401`; a valid token of the wrong role, or someone else's record, is `403`.

Identity always comes from the token, never from the request. The student on a new report or claim is `req.user.studentId`, and the admin who verifies an item or decides a claim is `req.user.adminId`; a `studentId` or `adminId` in a request body is ignored. Student tokens issued before roles existed (no `role` claim) are still accepted as student tokens.

## How Match Scores Work

A score is always **derived on demand and never stored** (there is no score column on `MATCH_RECORD`). It is a number from 0 to 1:

- **Text score:** the Python text service (TF-IDF + cosine over category, brand, colour and description). If that service is down, a built-in weighted string comparison is used instead.
- **Image score:** if **both** items have an uploaded photo, the first photo of each is sent to the image service (`ML_SIMILARITY_URL`, which answers 0 to 100; the backend converts it to 0 to 1). If either item has no photo, a photo file is missing, or the image service is down or slow, the image score is `null`.
- **Final score:** `(1 - IMAGE_WEIGHT) * text + IMAGE_WEIGHT * image` when an image score exists (default weight `0.4`), otherwise just the text score.

`GET /api/matches/candidates/:lostId` returns `[{ foundItem, score, textScore, imageScore }]`, best first. To keep it fast, the text score is computed for every candidate but the image score only for the 5 best by text score; the rest get `imageScore: null`.

Uploaded photos are served from `/uploads/lost/<file>` and `/uploads/found/<file>`.

## Automatic Matching

When a student reports a lost or found item (and again after photos are uploaded for it), the backend looks for likely matches in the background:

- It compares the item with every **open** item of the opposite type reported by a **different student** (found items that already have a Confirmed match are skipped).
- Pairs scoring at or above `AUTO_MATCH_THRESHOLD` (default `0.7`, using the final score described above, so matching photos can lift a pair over the line) are ranked, and the **top 3** get a `Pending` match record. Both students are notified, with the percentage shown in the message text only. The score is never stored.
- It is idempotent (re-running never creates a duplicate pair) and never affects the HTTP response of the request that triggered it. If the text service is down, the built-in stub scorer is used.
- Matches are still reviewed by a person: `PATCH /api/matches/:id/status` confirms or rejects them.

## Status Lifecycle

Item and match statuses change automatically as a report moves through the system:

| Record | Status | How it changes |
|---|---|---|
| Lost item | `Open` | Default when reported. Only `Open` lost items can get new matches. |
| | `Matched` | One of its matches is **Confirmed**. Goes back to `Open` if that match is moved to Pending/Rejected and no other Confirmed match exists. |
| | `Closed` | A claim on its Confirmed found item is **Approved**. |
| Found item | `Open` | Default when reported. Only `Open` found items without a Confirmed match can get new matches. |
| | `Claimed` | A claim on it is **Approved**. |
| | `Returned` | An admin marks a `Claimed` item as handed back (`PUT /api/admin/found/:id/return`). The lost report it was confirmed against is `Closed`. |
| Match | `Pending` | Created automatically or with `POST /api/matches`. |
| | `Confirmed` / `Rejected` | Set with `PATCH /api/matches/:id/status`. |
| Claim | `Pending` | Filed with `POST /api/claims`. |
| | `Approved` / `Rejected` | Set with `PUT /api/claims/:id/status`. Approving is refused with `409` if the found item is already `Claimed` or `Returned`. |

Rules that return `409 Conflict`: creating a match for an item that is not `Open`, for a found item that already has a Confirmed match, or for a pair that already exists; confirming a match whose items are no longer open or whose found item already has another Confirmed match; approving a claim on an already claimed or returned item.

**Spam removal is the one deliberate hard delete.** Everything else keeps its history through the statuses above, but an admin can permanently remove a spam report with `DELETE /api/admin/lost/:id` or `DELETE /api/admin/found/:id`. It runs in a transaction (all or nothing), deletes the dependents first (photo rows, match records, those matches' notifications and, for a found item, its claims), removes the photo files from `uploads/` after the commit, and returns the counts. Notifications about a claim's outcome are not tied to the item by a foreign key and are left in place.

Notifications are created for these events (a failed notification never undoes the action that triggered it):

| Event | Who is notified | `MatchID` |
|---|---|---|
| Automatic match found | The lost owner and the finder | the new match |
| Match confirmed | The lost owner and the finder | the match |
| Claim approved or rejected | The student who filed the claim | none |

## API Reference

The project API includes 40 requests across the following modules. In the `Auth` column, "Student", "Admin" and "Owner or admin" are explained under [Authentication](#authentication).

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | none | Check server and database connection status |

### Student

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/students/register` | none | Register a new student account (bcrypt-hashed password) |
| POST | `/api/students/login` | none | Authenticate student and receive a JWT |
| GET | `/api/students/me` | Student | Get authenticated student profile from decoded token |
| PUT | `/api/students/me` | Student | Edit own profile. Only `name`, `phone`, `department`, `year` (1 to 10) and `hostel` can change (send any subset; `null` or `""` clears an optional field). `email`, `password` and `StudentID` are never changeable here and are ignored. Invalid values return `400` |

### Lost Item

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/lost-items` | Student | Create a new lost item report |
| GET | `/api/lost-items` | none | List all lost items |
| GET | `/api/lost-items/student/:studentId` | none | List lost items reported by a specific student |
| GET | `/api/lost-items/:id` | none | Get details of a specific lost item by ID |

### Found Item

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/found-items` | Student | Create a new found item report |
| GET | `/api/found-items` | none | List all found items |
| GET | `/api/found-items/student/:studentId` | none | List found items reported by a specific student |
| GET | `/api/found-items/:id` | none | Get details of a specific found item by ID |

### Match

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/matches/candidates/:lostId` | none | Compute live match candidate scores for a lost item (`score`, `textScore`, `imageScore`) |
| POST | `/api/matches` | Any token | Create a match record between a lost item and a found item |
| GET | `/api/matches` | none | List all match records |
| GET | `/api/matches/:id` | none | Get a match record by ID |
| PATCH | `/api/matches/:id/status` | Owner or admin | Update match status (Pending, Confirmed, Rejected); only the lost item's owner or an admin |

### Admin

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/login` | none | Admin logs in with email and password and receives an admin JWT (`{ token, admin }`) |
| GET | `/api/admin/pending` | Admin | List pending lost and found items awaiting verification |
| PUT | `/api/admin/lost/:id/verify` | Admin | Verify a lost item report (the admin comes from the token) |
| PUT | `/api/admin/found/:id/verify` | Admin | Verify a found item report (the admin comes from the token) |
| PUT | `/api/admin/found/:id/return` | Admin | Mark a `Claimed` found item as `Returned` and close the lost report it was confirmed against. `409` unless the item is `Claimed` |
| DELETE | `/api/admin/lost/:id` | Admin | **Permanently** remove a spam lost report with its photos (rows and files), match records and those matches' notifications. Returns counts of what was removed |
| DELETE | `/api/admin/found/:id` | Admin | **Permanently** remove a spam found report with its photos, match records and their notifications, and the claims on it. A lost report that was `Matched` only through a removed Confirmed match goes back to `Open` |

### Claim

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/claims` | Admin | List all claims, newest first, each with the claimant's `StudentName` and the item's `FoundItemName` |
| POST | `/api/claims` | Student | Submit an ownership claim for a found item (body: `foundId`; the claimant comes from the token) |
| GET | `/api/claims/student/:studentId` | Owner or admin | List all claims submitted by a student (that student, or an admin) |
| GET | `/api/claims/found/:foundId` | Owner or admin | List all claims on a found item (the student who reported it, or an admin) |
| PUT | `/api/claims/:id/status` | Admin | Approve or reject a claim (the deciding admin comes from the token) |

### Notification

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications/student/:studentId` | Owner or admin | Retrieve notifications for a specific student (that student, or an admin) |
| PUT | `/api/notifications/:id/read` | Owner or admin | Mark a specific notification as read (its own student, or an admin) |

### Image Upload

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/uploads/lost/:lostId` | Owner or admin | Upload images for a lost item (only the student who reported it, or an admin) |
| POST | `/api/uploads/found/:foundId` | Owner or admin | Upload images for a found item (only the student who reported it, or an admin) |
| GET | `/api/uploads/lost/:lostId` | none | Retrieve image URLs for a lost item |
| GET | `/api/uploads/found/:foundId` | none | Retrieve image URLs for a found item |

### Image Similarity

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | none | Image similarity microservice health check |
| POST | `/compare-images` | none | Compare two uploaded image files and return similarity score |
| POST | `/compare-image-urls` | none | Compare two images via URLs and return similarity score |
| POST | `/extract-features` | none | Extract feature embedding vector from an uploaded image |

## Database Design

The schema defines 9 tables:
- `STUDENT`
- `ADMIN`
- `LOST_ITEM`
- `LOST_ITEM_IMAGE`
- `FOUND_ITEM`
- `FOUND_ITEM_IMAGE`
- `MATCH_RECORD`
- `CLAIM`
- `NOTIFICATION`

`MATCH_RECORD` is used instead of `MATCH` because `MATCH` is a MySQL reserved word.

## Demo

### Reset to the demo data

```bash
npm run demo:reset
```

This **erases the whole local `campusfind_ai` database** and loads the demo dataset (`sql/demo-data.sql`), then replaces the upload folders with the demo photos from `demo/images/`. It shows what it is about to erase and asks you to type `YES` (add `-- --yes` to skip the question). It refuses to run unless the database is on this computer and named `campusfind_ai`. It takes a few seconds, so run it before every rehearsal and before the real demo.

| Who | Email | Password |
|---|---|---|
| Students | `navika@campus.edu`, `parthvi@campus.edu`, `rohan@campus.edu`, `aarav@campus.edu`, `ishita@campus.edu`, `kabir@campus.edu` | `Demo@12345` |
| Admin | `admin@campus.edu` | `Admin@12345` |

### What the demo data shows

| Story | Records | Where it shows up |
|---|---|---|
| Matches waiting for review | Water Bottle with Steel Bottle, Wired Earphones with Earphones, Black Backpack with Black Laptop Bag | Matches and notifications with a similarity percentage. The bottle pair uses the same photo on both sides, so its image score is 1.0 |
| A confirmed match with a claim waiting | Hostel Room Keys with Keys with Red Tag, and Rohan's Pending claim | Log in as the admin and approve the claim: the found item becomes `Claimed` and the lost report `Closed` |
| A finished story | Brown Leather Wallet with Brown Wallet: Parthvi's claim rejected, Ishita's approved, wallet `Returned`, lost report `Closed` | Claim history and the full status lifecycle |
| A rejected match | Scientific Calculator with Basic Calculator | Shows the `Rejected` status |
| Waiting for the admin | Lost: Backpack, Umbrella, Calculator. Found: Basic Calculator | The admin's pending-verification list |

### Live demo script (about 7 minutes)

Black headphones are deliberately **not** in the data, so a live report produces one clean match. Start the backend and both Python services first (see [Run everything](#6-run-everything-3-terminals)), then use two browser windows (a normal one and a private one).

1. **Navika** (`navika@campus.edu`) reports a lost item: `Black Sony Headphones`, category `Electronics`, brand `Sony`, colour `Black`, description `black sony over ear headphones`, location `Library`, photo `demo/images/headphones.png`.
2. **Kabir** (`kabir@campus.edu`, second window) reports a found item: `Sony Headphones`, `Electronics`, `Sony`, `Black`, description `black sony headphones found near the library`, location `Library`, the same photo.
3. Within a second a **Pending match** appears with a notification for both (about 78% with the text and image services running). The text alone scores 0.63, below the 0.7 threshold, so it is the matching photos that push it over: a good moment to explain the blended score.
4. Navika opens her matches and **confirms** it. The lost report becomes `Matched`.
5. Navika files a **claim**. Log in as `admin@campus.edu`, verify the reports, **approve** the claim (found item `Claimed`, lost report `Closed`), then mark the item **returned**.
6. Open the database (MySQL Workbench or the command line) and show `DESCRIBE MATCH_RECORD;`: there is no score column, because the score is derived, never stored.
7. Stop the text service and report another pair: matching still works through the built-in scorer.
8. In Postman, show a student getting `403` on an admin route.

Afterwards run `npm run demo:reset` to put everything back.

### Backups

```bash
npm run demo:dump
```

writes the whole database to `backups/campusfind_<date-time>.sql` (the folder is gitignored). To restore it on a computer with the same operating system:

```bash
node scripts/run-sql.js backups/<file>.sql --allow-drop
```

`mysqldump` on Windows writes table names in lowercase, so a dump taken on Windows does not match the uppercase names the code uses if restored on Linux or macOS. To rebuild the demo on any other machine, run `npm run demo:reset` there instead: it works everywhere and needs nothing but MySQL and Node.

## Testing

### Smoke test (whole flow, one command)

`npm run smoke` (see [Smoke test](#7-smoke-test)) exercises registration, item reports, admin verification, automatic matching, confirmation, claims and notifications against a running backend and prints `PASS` / `FAIL` for each check.

### Postman Collection

The Postman collection is located at `postman/CampusFind_AI_Assigned_Modules.postman_collection.json` and contains 40 requests covering all endpoints. Request descriptions in the Match and Claim folders explain the status changes and `409` rules described above.

Instructions:
1. Start the Node backend (`npm start`).
2. Start the Image Similarity FastAPI service (port 8001) when testing ML endpoints.
3. Import the collection into Postman.
4. Verify collection variables:
   - `baseUrl = http://localhost:5000`
   - `mlUrl = http://localhost:8001`
5. Send **Login Student** (Student folder) first; the returned JWT is saved as `authToken` and used by the student requests. Set the `studentId` variable to that student's own ID, since students can only read their own notifications.
6. For admin requests (pending list, verify, **Claim / Update Claim Status**) send **Admin Login** (Admin folder) first; its JWT is saved as `adminToken`.

### Image Similarity Tests

Run the test script:

```powershell
cd ml-service
.\.venv\Scripts\python.exe test_service.py
```

## Conventions

- `StudentID` on any write always comes from the decoded JWT (`req.user.studentId`), and the acting admin from `req.user.adminId`; neither is ever trusted from the request body.
- All SQL uses `?` placeholders — no string-concatenated queries.
- Passwords are bcrypt-hashed before storage and never returned in API responses.
- Status codes: `201` create, `404` not found, `401` auth failure, `409` conflict, `500` + logged error on failure.
- Config lives in `.env` (gitignored) — see `.env.example` for required keys.

## Database Design Notes

- 9 tables: `STUDENT`, `ADMIN`, `LOST_ITEM`, `LOST_ITEM_IMAGE`, `FOUND_ITEM`, `FOUND_ITEM_IMAGE`, `MATCH_RECORD`, `CLAIM`, `NOTIFICATION`.
- `ADMIN` is `ADMIN(AdminID, Name, Email, Password)`, where `Password` is a nullable bcrypt hash (an admin with no password cannot log in).
- `LOST_ITEM_IMAGE` / `FOUND_ITEM_IMAGE` resolve the multivalued `ImageURL` attribute via composite PKs and cascade delete.
- `MATCH_RECORD` is named to avoid the `MATCH` reserved word in MySQL, and has no `MatchScore` column — the score is derived live by the matching service, not stored (a normalization decision).
- `MATCH` and `CLAIM` started as M:N relationships in the ER diagram but were promoted to full entities because they needed their own attributes and a referenceable ID (e.g. `NOTIFICATION.MatchID` points at one specific match).
