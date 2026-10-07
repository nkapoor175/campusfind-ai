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

Then edit `.env` and set the database values (see [Database hosting](#database-hosting-local-mysql-or-railway) below) and a long random `JWT_SECRET`. `.env` is gitignored; never commit it.

### 2. Database

No `mysql` command-line client is needed. The repo includes a small runner that uses the credentials in `.env`:

```bash
node scripts/run-sql.js sql/schema.sql
node scripts/run-sql.js sql/seed.sql
```

This creates the `campusfind_ai` database with all 9 tables and loads demo data (3 students, 1 admin, 2 lost items, 2 found items, 2 pending matches).

> **`schema.sql` drops and recreates every table.** `run-sql.js` therefore refuses to run any file containing `DROP TABLE` against a database that already has rows, and lists the tables that would be wiped. Pass `--allow-drop` only if you really want that data gone. Schema changes for a database that already has data go in `sql/migrations/` instead.

> Seed passwords are plain placeholder strings, not bcrypt hashes, so **seeded students cannot log in**. They exist to populate foreign keys for testing. Create real accounts with `POST /api/students/register`, which hashes passwords with bcrypt. The seeded admin is `AdminID 1` (`admin@campus.edu`); the admin endpoints currently take `adminId` in the request body.

### Database hosting: local MySQL or Railway

The backend only cares about the five `DB_*` values in `.env`, so the same code runs against either.

**Local MySQL:** install MySQL 8, start it, then use `DB_HOST=127.0.0.1`, `DB_PORT=3306`, your `DB_USER` / `DB_PASSWORD`, and `DB_NAME=campusfind_ai`.

**Railway MySQL:**

1. In Railway, open your project, click the MySQL service, then open **Variables** (or **Settings → Networking → TCP Proxy**).
2. Copy `RAILWAY_TCP_PROXY_DOMAIN` into `DB_HOST` and `RAILWAY_TCP_PROXY_PORT` into `DB_PORT`. The password shown for the service goes into `DB_PASSWORD`.
3. Keep `DB_NAME=campusfind_ai`. Do **not** use Railway's default `railway` database: `schema.sql` creates and uses `campusfind_ai`.
4. Do **not** use `mysql.railway.internal` from your own computer. That hostname only resolves inside Railway; from outside you must use the public TCP proxy domain.
5. Run the two `run-sql.js` commands above once to create the tables.

> Railway trial credit runs out. For a final submission, use a database that will still be running on demo day (local MySQL on the demo machine, or a hosted MySQL). Moving is a `.env` change plus re-running the two SQL files.

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

It registers two fresh users, reports a lost and a found item, has the seeded admin verify them, checks candidate scores, waits for the automatic match, confirms it, files and approves a claim, and checks every status and notification along the way. Each check prints `PASS` or `FAIL`; the exit code is non-zero if anything fails. By default it deletes everything it created. To leave the data in place for a demo (it prints the two test logins), run:

```bash
npm run smoke -- --keep
```

It expects the seeded admin (`AdminID 1`); set `SMOKE_ADMIN_ID` or `SMOKE_BASE_URL` in the environment to override the admin id or server address.

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
| `authToken` | JWT Bearer token obtained from login | *(dynamically set)* |

## Authentication

Authentication is handled via JWT bearer tokens.

### Public Endpoints
- `POST /api/students/register`
- `POST /api/students/login`

### Protected Endpoints (Require JWT)
- `GET /api/students/me`
- `POST /api/lost-items`
- `POST /api/found-items`
- `POST /api/matches`
- `PATCH /api/matches/:id/status`

On protected routes, the student's identity is derived directly from `req.user.studentId` in the decoded token.

> **Note:** The Admin, Claim, Notification, and Image Upload endpoints currently do not enforce JWT.

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
| | `Returned` | Exists in the schema, but no endpoint sets it yet. |
| Match | `Pending` | Created automatically or with `POST /api/matches`. |
| | `Confirmed` / `Rejected` | Set with `PATCH /api/matches/:id/status`. |
| Claim | `Pending` | Filed with `POST /api/claims`. |
| | `Approved` / `Rejected` | Set with `PUT /api/claims/:id/status`. Approving is refused with `409` if the found item is already `Claimed` or `Returned`. |

Rules that return `409 Conflict`: creating a match for an item that is not `Open`, for a found item that already has a Confirmed match, or for a pair that already exists; confirming a match whose items are no longer open or whose found item already has another Confirmed match; approving a claim on an already claimed or returned item.

Notifications are created for these events (a failed notification never undoes the action that triggered it):

| Event | Who is notified | `MatchID` |
|---|---|---|
| Automatic match found | The lost owner and the finder | the new match |
| Match confirmed | The lost owner and the finder | the match |
| Claim approved or rejected | The student who filed the claim | none |

## API Reference

The project API includes 34 requests across the following modules:

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | none | Check server and database connection status |

### Student

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/students/register` | none | Register a new student account (bcrypt-hashed password) |
| POST | `/api/students/login` | none | Authenticate student and receive a JWT |
| GET | `/api/students/me` | JWT | Get authenticated student profile from decoded token |

### Lost Item

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/lost-items` | JWT | Create a new lost item report |
| GET | `/api/lost-items` | none | List all lost items |
| GET | `/api/lost-items/student/:studentId` | none | List lost items reported by a specific student |
| GET | `/api/lost-items/:id` | none | Get details of a specific lost item by ID |

### Found Item

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/found-items` | JWT | Create a new found item report |
| GET | `/api/found-items` | none | List all found items |
| GET | `/api/found-items/student/:studentId` | none | List found items reported by a specific student |
| GET | `/api/found-items/:id` | none | Get details of a specific found item by ID |

### Match

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/matches/candidates/:lostId` | none | Compute live match candidate scores for a lost item (`score`, `textScore`, `imageScore`) |
| POST | `/api/matches` | JWT | Create a match record between a lost item and a found item |
| GET | `/api/matches` | none | List all match records |
| GET | `/api/matches/:id` | none | Get a match record by ID |
| PATCH | `/api/matches/:id/status` | JWT | Update match status (Pending, Confirmed, Rejected) |

### Admin

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/pending` | none | List pending lost and found items awaiting verification |
| PUT | `/api/admin/lost/:id/verify` | none | Verify a lost item report |
| PUT | `/api/admin/found/:id/verify` | none | Verify a found item report |

### Claim

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/claims` | none | Submit an ownership claim for a found item |
| GET | `/api/claims/student/:studentId` | none | List all claims submitted by a student |
| GET | `/api/claims/found/:foundId` | none | List all claims associated with a found item |
| PUT | `/api/claims/:id/status` | none | Update claim status |

### Notification

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications/student/:studentId` | none | Retrieve notifications for a specific student |
| PUT | `/api/notifications/:id/read` | none | Mark a specific notification as read |

### Image Upload

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/uploads/lost/:lostId` | none | Upload images for a lost item |
| POST | `/api/uploads/found/:foundId` | none | Upload images for a found item |
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

## Testing

### Smoke test (whole flow, one command)

`npm run smoke` (see [Smoke test](#7-smoke-test)) exercises registration, item reports, admin verification, automatic matching, confirmation, claims and notifications against a running backend and prints `PASS` / `FAIL` for each check.

### Postman Collection

The Postman collection is located at `postman/CampusFind_AI_Assigned_Modules.postman_collection.json` and contains 34 requests covering all endpoints. Request descriptions in the Match and Claim folders explain the status changes and `409` rules described above.

Instructions:
1. Start the Node backend (`npm start`).
2. Start the Image Similarity FastAPI service (port 8001) when testing ML endpoints.
3. Import the collection into Postman.
4. Verify collection variables:
   - `baseUrl = http://localhost:5000`
   - `mlUrl = http://localhost:8001`
5. Send **Login Student** (in the Student folder) first; the returned JWT is automatically saved as `authToken`.

### Image Similarity Tests

Run the test script:

```powershell
cd ml-service
.\.venv\Scripts\python.exe test_service.py
```

## Conventions

- `StudentID` on any write always comes from the decoded JWT (`req.user.studentId`), never trusted from the request body.
- All SQL uses `?` placeholders — no string-concatenated queries.
- Passwords are bcrypt-hashed before storage and never returned in API responses.
- Status codes: `201` create, `404` not found, `401` auth failure, `409` conflict, `500` + logged error on failure.
- Config lives in `.env` (gitignored) — see `.env.example` for required keys.

## Database Design Notes

- 9 tables: `STUDENT`, `ADMIN`, `LOST_ITEM`, `LOST_ITEM_IMAGE`, `FOUND_ITEM`, `FOUND_ITEM_IMAGE`, `MATCH_RECORD`, `CLAIM`, `NOTIFICATION`.
- `LOST_ITEM_IMAGE` / `FOUND_ITEM_IMAGE` resolve the multivalued `ImageURL` attribute via composite PKs and cascade delete.
- `MATCH_RECORD` is named to avoid the `MATCH` reserved word in MySQL, and has no `MatchScore` column — the score is derived live by the matching service, not stored (a normalization decision).
- `MATCH` and `CLAIM` started as M:N relationships in the ER diagram but were promoted to full entities because they needed their own attributes and a referenceable ID (e.g. `NOTIFICATION.MatchID` points at one specific match).
