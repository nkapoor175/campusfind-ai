# CampusFind AI — Backend

DBMS mini project: a structured lost & found platform for a college campus, with an AI matching layer that compares lost/found reports and surfaces likely matches. AI is a process, not a database entity — it reads item data and returns match scores; scores are never stored (see `MATCH_RECORD` in the schema).

This repo currently covers **Navika's half**: Student auth, Lost/Found item CRUD, Match endpoints with a stub scorer, and the wiring to a Python text-similarity microservice. Admin, Claim, Notification, image upload, and image similarity are Parthvi's half and are merged in separately.

## Architecture

- **Node.js + Express + MySQL** (`mysql2`, raw parameterized queries, no ORM) — auth, CRUD, business logic.
- **Python + FastAPI microservice** — ML matching only (TF-IDF/cosine text similarity now; image similarity is Parthvi's half). Node calls it over HTTP with a timeout, falling back to a local stub scorer if it's unreachable.

## Setup

### 1. Node backend

```bash
npm install
cp .env.example .env   # then fill in DB credentials and JWT_SECRET
```

### 2. Database

```bash
mysql -u root -p < sql/schema.sql
mysql -u root -p < sql/seed.sql
```

This creates the `campusfind_ai` database with all 9 tables and loads demo data (3 students, 2 lost items, 2 found items, 2 pending matches).

> Seed passwords are plain placeholder strings, not bcrypt hashes — they exist to populate FK relationships for testing item/match endpoints. Log in with real accounts via `/api/students/register`, which hashes on the way in.

### 3. Run the server

```bash
npm start
```

Confirm it's up before anything else:

```bash
curl http://localhost:5000/health
```

Should return `{"status":"ok","db":"connected"}`.

### 4. Python text-similarity service (optional for now)

```bash
cd python-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

If this service isn't running, the Node match endpoints automatically fall back to a local weighted string-comparison scorer — nothing breaks, matching just gets less accurate.

## Endpoints

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | none | `SELECT 1` against MySQL |

### Students

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/students/register` | none | Create a student account (bcrypt-hashes password) |
| POST | `/api/students/login` | none | Returns a JWT + student profile |
| GET | `/api/students/me` | JWT | Current student's profile (from decoded token) |

### Lost Items

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/lost-items` | JWT | Create a lost item report (StudentID from token) |
| GET | `/api/lost-items` | none | List all lost items |
| GET | `/api/lost-items/:id` | none | Get a lost item by id |
| GET | `/api/lost-items/student/:studentId` | none | List lost items reported by a student |

### Found Items

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/found-items` | JWT | Create a found item report (StudentID from token) |
| GET | `/api/found-items` | none | List all found items |
| GET | `/api/found-items/:id` | none | Get a found item by id |
| GET | `/api/found-items/student/:studentId` | none | List found items reported by a student |

### Matches

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/matches/candidates/:lostId` | none | Score every open found item against a lost item, sorted best-first (live-computed, not stored) |
| POST | `/api/matches` | JWT | Create a `MATCH_RECORD` linking a lost item and a found item |
| GET | `/api/matches` | none | List all match records |
| GET | `/api/matches/:id` | none | Get a match record by id |
| PATCH | `/api/matches/:id/status` | JWT | Update `MatchStatus` (`Pending` / `Confirmed` / `Rejected`) |

## Conventions

- `StudentID` on any write always comes from the decoded JWT (`req.user.studentId`), never trusted from the request body.
- All SQL uses `?` placeholders — no string-concatenated queries.
- Passwords are bcrypt-hashed before storage and never returned in API responses.
- Status codes: `201` create, `404` not found, `401` auth failure, `409` conflict, `500` + logged error on failure.
- Config lives in `.env` (gitignored) — see `.env.example` for required keys.

## Database design notes

- 9 tables: `STUDENT`, `ADMIN`, `LOST_ITEM`, `LOST_ITEM_IMAGE`, `FOUND_ITEM`, `FOUND_ITEM_IMAGE`, `MATCH_RECORD`, `CLAIM`, `NOTIFICATION`.
- `LOST_ITEM_IMAGE` / `FOUND_ITEM_IMAGE` resolve the multivalued `ImageURL` attribute via composite PKs and cascade delete.
- `MATCH_RECORD` is named to avoid the `MATCH` reserved word in MySQL, and has no `MatchScore` column — the score is derived live by the matching service, not stored (a normalization decision).
- `MATCH` and `CLAIM` started as M:N relationships in the ER diagram but were promoted to full entities because they needed their own attributes and a referenceable ID (e.g. `NOTIFICATION.MatchID` points at one specific match).
