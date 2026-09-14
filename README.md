# CampusFind AI – Smart Lost & Found Management System

A college DBMS project that streamlines lost-and-found item management with AI-powered image similarity matching.

---

## Technology Stack

| Layer              | Technology                      |
| ------------------ | ------------------------------- |
| Backend API        | Node.js, Express               |
| Database           | MySQL                          |
| Authentication     | JWT, bcryptjs                  |
| File Uploads       | Multer                         |
| ML Microservice    | Python, FastAPI                |
| Image Processing   | Pillow, NumPy                  |

---

## Folder Structure

```
CampusFind-AI/
├── backend/                 # Node.js + Express API
│   ├── config/              #   Database & app configuration
│   ├── controllers/         #   Route handler logic
│   ├── middleware/           #   Auth, error-handling, upload middleware
│   ├── routes/              #   Express route definitions
│   ├── services/            #   Business logic & helper services
│   ├── uploads/             #   Uploaded item images (git-ignored)
│   ├── server.js            #   Express entry point
│   ├── .env.example         #   Environment variable template
│   └── .gitignore
│
├── ml-service/              # Python FastAPI microservice
│   ├── main.py              #   FastAPI entry point
│   └── requirements.txt     #   Python dependencies
│
├── database/                # SQL scripts
│   ├── schema.sql           #   Table definitions
│   └── seed.sql             #   Sample / test data
│
├── postman/                 # API testing
│   └── README.md
│
└── README.md                # ← You are here
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MySQL** ≥ 8.0
- **Python** ≥ 3.10

---

### 1. Clone the repository

```bash
git clone <repo-url>
cd campusfind-ai
```

### 2. Run the Node.js backend

```bash
cd backend

# Create your .env from the template
cp .env.example .env
# → Edit .env with your MySQL credentials and JWT secret

# Install dependencies (already done if you just cloned)
npm install

# Start the server
node server.js
```

The backend will be available at **http://localhost:5000**.  
Verify with: `GET http://localhost:5000/api/health`

### 3. Run the Python ML service

```bash
cd ml-service

# Create a virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Start the service
uvicorn main:app --reload --port 8000
```

The ML service will be available at **http://localhost:8000**.  
Verify with: `GET http://localhost:8000/health`

---

## License

This project is for academic / educational purposes.
