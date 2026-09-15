require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({ status: 'ok', db: 'connected' });
    } catch (err) {
        console.error('Health check failed:', err);
        res.status(500).json({ status: 'error', db: 'disconnected' });
    }
});

app.use('/api/students', require('./routes/student'));
app.use('/api/lost-items', require('./routes/lostItem'));
app.use('/api/found-items', require('./routes/foundItem'));
app.use('/api/matches', require('./routes/match'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`CampusFind AI backend running on port ${PORT}`);
});
