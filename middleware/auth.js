const jwt = require('jsonwebtoken');

// Two kinds of token exist:
//   student: { studentId, role: 'student' }  -> req.user = { studentId, role: 'student' }
//   admin:   { adminId,   role: 'admin' }    -> req.user = { adminId,   role: 'admin' }
// Student tokens issued before roles existed carry only studentId and are still accepted as students.
//
// Failures send both `error` and `message` so clients of either response style can read them.
function deny(res, status, text) {
    return res.status(status).json({ error: text, message: text });
}

// Any valid token (student or admin). Use requireStudent / requireAdmin when the role matters.
function authenticate(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return deny(res, 401, 'Missing or malformed Authorization header');
    }

    const token = header.split(' ')[1];

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return deny(res, 401, 'Invalid or expired token');
    }

    const role = decoded.role || 'student';
    if (role === 'admin' && decoded.adminId) {
        req.user = { adminId: decoded.adminId, role };
    } else if (role === 'student' && decoded.studentId) {
        req.user = { studentId: decoded.studentId, role };
    } else {
        return deny(res, 401, 'Invalid or expired token');
    }
    next();
}

// Only a logged-in student (for routes that act as "the current student").
function requireStudent(req, res, next) {
    authenticate(req, res, () => {
        if (req.user.role !== 'student') {
            return deny(res, 403, 'A student account is required for this action');
        }
        next();
    });
}

// Only a logged-in admin.
function requireAdmin(req, res, next) {
    authenticate(req, res, () => {
        if (req.user.role !== 'admin') {
            return deny(res, 403, 'Admin access required');
        }
        next();
    });
}

module.exports = authenticate;
module.exports.authenticate = authenticate;
module.exports.requireStudent = requireStudent;
module.exports.requireAdmin = requireAdmin;
