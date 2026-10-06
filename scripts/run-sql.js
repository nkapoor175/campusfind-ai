// Runs a .sql file against the MySQL server described in .env (no mysql CLI needed).
//
// Usage:  node scripts/run-sql.js sql/schema.sql
//         node scripts/run-sql.js sql/migrations/001_admin_password.sql
//
// Safety: sql/schema.sql DROPs and recreates every table. If the file contains
// DROP TABLE and the target database already has rows in any app table, this
// script refuses to run it unless you pass --allow-drop.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const APP_TABLES = [
    'STUDENT', 'ADMIN', 'LOST_ITEM', 'LOST_ITEM_IMAGE', 'FOUND_ITEM',
    'FOUND_ITEM_IMAGE', 'MATCH_RECORD', 'CLAIM', 'NOTIFICATION'
];

async function tablesWithData(conn, dbName) {
    const [existing] = await conn.query(
        'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?',
        [dbName]
    );
    const present = existing.map((r) => r.TABLE_NAME.toUpperCase()).filter((t) => APP_TABLES.includes(t));

    const populated = [];
    for (const table of present) {
        // Table names come from the fixed APP_TABLES list above, never from user input.
        const [[{ n }]] = await conn.query(`SELECT COUNT(*) AS n FROM \`${dbName}\`.\`${table}\``);
        if (n > 0) populated.push(`${table} (${n} rows)`);
    }
    return populated;
}

async function main() {
    const args = process.argv.slice(2);
    const allowDrop = args.includes('--allow-drop');
    const sqlArg = args.find((a) => !a.startsWith('--'));

    if (!sqlArg) {
        console.error('Usage: node scripts/run-sql.js <path-to-sql-file> [--allow-drop]');
        process.exit(1);
    }

    const sqlPath = path.resolve(sqlArg);
    if (!fs.existsSync(sqlPath)) {
        console.error(`File not found: ${sqlPath}`);
        process.exit(1);
    }
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Connect WITHOUT a database selected, so schema.sql can CREATE DATABASE itself.
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true
    });

    try {
        if (/DROP\s+TABLE/i.test(sql) && !allowDrop) {
            const populated = await tablesWithData(conn, process.env.DB_NAME);
            if (populated.length > 0) {
                console.error(`Refusing to run ${sqlArg}: it drops tables, and "${process.env.DB_NAME}" already has data:`);
                populated.forEach((t) => console.error(`  - ${t}`));
                console.error('Re-run with --allow-drop only if you really want to wipe this data.');
                process.exit(2);
            }
        }

        await conn.query(sql);
        console.log(`OK: ran ${sqlArg} against ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    } finally {
        await conn.end();
    }
}

main().catch((err) => {
    console.error('run-sql failed:', err.message);
    process.exit(1);
});
