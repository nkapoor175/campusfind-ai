# CampusFind AI — Backend

DBMS mini project: a structured lost & found platform for a college campus, with an AI matching layer that compares lost/found reports and surfaces likely matches. AI is a process, not a database entity — it reads item data and returns match scores; scores are never stored (see `MATCH_RECORD` in the schema).

This project implements the complete CampusFind AI backend, covering student authentication, lost and found item management, match calculation, admin verification, claim handling, notification delivery, image upload endpoints, and a separate image-similarity microservice.

## Architecture

- **Node.js + Express + MySQL** (`mysql2`, raw parameterized queries, no ORM) — core backend for student authentication, item CRUD, and business logic.
- **Python text-similarity service** under `python-service/` — text similarity matching microservice; Node calls it over HTTP with a timeout, falling back to a local stub scorer if unreachable.
- **Separate Python FastAPI Image Similarity service** under `ml-service/` — standalone image feature extraction and cosine similarity microservice.
- **Postman collection** under `postman/` — collection covering all API requests across the system.

## Setup

### 1. Node backend

```bash
npm install
cp .env.example .env
npm start
```

Confirm the server is up:

```bash
curl http://localhost:5000/health
```

Should return `{"status":"ok","db":"connected"}`.

### 2. Database

```bash
mysql -u root -p < sql/schema.sql
mysql -u root -p < sql/seed.sql
```

This creates the `campusfind_ai` database with all 9 tables and loads demo data (3 students, 2 lost items, 2 found items, 2 pending matches).

> Seed passwords are plain placeholder strings, not bcrypt hashes — they exist to populate FK relationships for testing item/match endpoints. Log in with real accounts via `/api/students/register`, which hashes on the way in.

### 3. Python text-similarity service (optional)

```bash
cd python-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

If this service isn't running, the Node match endpoints automatically fall back to a local weighted string-comparison scorer — nothing breaks, matching just gets less accurate.

### 4. Image Similarity service

The Image Similarity service is a separate FastAPI service located in `ml-service/`:

```bash
cd ml-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

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

### Postman Variables

Configured in the Postman collection:

| Variable | Description | Value |
|---|---|---|
| `baseUrl` | Base URL for the Node.js backend | `http://localhost:5000` |
| `mlUrl` | Base URL for the separate Image Similarity service | `http://localhost:8000` |
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
| GET | `/api/matches/candidates/:lostId` | none | Compute live match candidate scores for a lost item |
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

### Postman Collection

The Postman collection is located at `postman/CampusFind_AI_Assigned_Modules.postman_collection.json` and contains 34 requests covering all endpoints.

Instructions:
1. Start the Node backend (`npm start`).
2. Start the Image Similarity FastAPI service when testing ML endpoints.
3. Import the collection into Postman.
4. Verify collection variables:
   - `baseUrl = http://localhost:5000`
   - `mlUrl = http://localhost:8000`
5. Run the Login request under Auth to authenticate; the returned JWT is automatically set as `authToken`.

### Image Similarity Tests

Run the test script:

```bash
python3 ml-service/test_service.py
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
