const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const authenticate = require('../middleware/auth');

const router = express.Router();
const SALT_ROUNDS = 10;

function toPublicStudent(row) {
    const { Password, ...rest } = row;
    return rest;
}

// POST /api/students/register
router.post('/register', async (req, res) => {
    const { name, email, phone, department, year, hostel, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'name, email and password are required' });
    }

    try {
        const [existing] = await pool.query('SELECT StudentID FROM STUDENT WHERE Email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'A student with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const [result] = await pool.query(
            `INSERT INTO STUDENT (Name, Email, Phone, Department, Year, Hostel, Password)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, email, phone || null, department || null, year || null, hostel || null, hashedPassword]
        );

        const [rows] = await pool.query('SELECT * FROM STUDENT WHERE StudentID = ?', [result.insertId]);

        return res.status(201).json(toPublicStudent(rows[0]));
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ error: 'Failed to register student' });
    }
});

// POST /api/students/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required' });
    }

    try {
        const [rows] = await pool.query('SELECT * FROM STUDENT WHERE Email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const student = rows[0];
        const match = await bcrypt.compare(password, student.Password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { studentId: student.StudentID },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({ token, student: toPublicStudent(student) });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Failed to log in' });
    }
});

// GET /api/students/me
router.get('/me', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM STUDENT WHERE StudentID = ?', [req.user.studentId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        return res.status(200).json(toPublicStudent(rows[0]));
    } catch (err) {
        console.error('Get profile error:', err);
        return res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

module.exports = router;
