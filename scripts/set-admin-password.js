// Sets an admin's password (stored as a bcrypt hash), or just prints a hash.
//
// Usage:  node scripts/set-admin-password.js <admin-email> <password>
//             updates ADMIN.Password in the database described by .env
//         node scripts/set-admin-password.js --hash-only <password>
//             prints a bcrypt hash and touches nothing (used to produce the hash in sql/seed.sql)
//
// Use this on a database that already has data (e.g. after sql/migrations/001_admin_password.sql),
// since re-running seed.sql is not an option there.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const SALT_ROUNDS = 10;

async function main() {
    const args = process.argv.slice(2);

    if (args[0] === '--hash-only') {
        if (!args[1]) {
            console.error('Usage: node scripts/set-admin-password.js --hash-only <password>');
            process.exit(1);
        }
        console.log(await bcrypt.hash(args[1], SALT_ROUNDS));
        return;
    }

    const [email, password] = args;
    if (!email || !password) {
        console.error('Usage: node scripts/set-admin-password.js <admin-email> <password>');
        process.exit(1);
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    try {
        const [result] = await conn.query('UPDATE ADMIN SET Password = ? WHERE Email = ?', [hash, email]);
        if (result.affectedRows === 0) {
            console.error(`No admin with email ${email} found.`);
            process.exit(1);
        }
        console.log(`Password updated for admin ${email}.`);
    } finally {
        await conn.end();
    }
}

main().catch((err) => {
    console.error('set-admin-password failed:', err.message);
    process.exit(1);
});
