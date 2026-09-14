const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

const adminRoutes = require('./routes/admin.routes');

// ---------------------------------------------------------------------------
// Health-check route
// ---------------------------------------------------------------------------
app.get('/api/health', async (_req, res) => {
  let dbStatus = 'disconnected';

  try {
    const [rows] = await pool.query('SELECT 1');
    if (rows) dbStatus = 'connected';
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  res.status(200).json({
    status: 'ok',
    message: 'CampusFind AI backend is running',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------
app.use('/api/admin', adminRoutes);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 CampusFind AI backend running on http://localhost:${PORT}`);
});
