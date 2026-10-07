const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { requireStudent } = require('../middleware/auth');

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
            { studentId: student.StudentID, role: 'student' },
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
router.get('/me', requireStudent, async (req, res) => {
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

// The only fields a student may change on their own profile (request key -> column).
// Email, password and StudentID can never be changed here; anything else in the body is ignored.
const EDITABLE_PROFILE_FIELDS = {
    name: { column: 'Name', maxLength: 100, required: true },
    phone: { column: 'Phone', maxLength: 20 },
    department: { column: 'Department', maxLength: 100 },
    year: { column: 'Year', integer: true },
    hostel: { column: 'Hostel', maxLength: 100 }
};

// Returns the value to store (null clears an optional field), or throws a message for a 400.
function cleanProfileValue(key, value) {
    const rule = EDITABLE_PROFILE_FIELDS[key];

    if (value === null || value === '') {
        if (rule.required) throw new Error(`${key} cannot be empty`);
        return null;
    }

    if (rule.integer) {
        const number = Number(value);
        if (!Number.isInteger(number) || number < 1 || number > 10) {
            throw new Error(`${key} must be a whole number from 1 to 10`);
        }
        return number;
    }

    if (typeof value !== 'string') throw new Error(`${key} must be text`);
    const text = value.trim();
    if (!text) {
        if (rule.required) throw new Error(`${key} cannot be empty`);
        return null;
    }
    if (text.length > rule.maxLength) throw new Error(`${key} must be at most ${rule.maxLength} characters`);
    return text;
}

// PUT /api/students/me - edit own profile (student token)
router.put('/me', requireStudent, async (req, res) => {
    const body = req.body || {};
    const assignments = [];
    const values = [];

    try {
        for (const key of Object.keys(EDITABLE_PROFILE_FIELDS)) {
            if (Object.prototype.hasOwnProperty.call(body, key)) {
                values.push(cleanProfileValue(key, body[key]));
                assignments.push(`${EDITABLE_PROFILE_FIELDS[key].column} = ?`);
            }
        }
    } catch (validationError) {
        return res.status(400).json({ error: validationError.message });
    }

    if (assignments.length === 0) {
        return res.status(400).json({ error: `Provide at least one of: ${Object.keys(EDITABLE_PROFILE_FIELDS).join(', ')}` });
    }

    try {
        // Column names come from the fixed EDITABLE_PROFILE_FIELDS map above; values are parameters.
        const [result] = await pool.query(
            `UPDATE STUDENT SET ${assignments.join(', ')} WHERE StudentID = ?`,
            [...values, req.user.studentId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const [rows] = await pool.query('SELECT * FROM STUDENT WHERE StudentID = ?', [req.user.studentId]);
        return res.status(200).json(toPublicStudent(rows[0]));
    } catch (err) {
        console.error('Update profile error:', err);
        return res.status(500).json({ error: 'Failed to update profile' });
    }
});

module.exports = router;
