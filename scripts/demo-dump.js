// Saves a backup of the whole database to a .sql file using mysqldump.
//
// Usage:  npm run demo:dump                       writes backups/campusfind_<date-time>.sql
//         npm run demo:dump -- my-backup.sql      writes to the file you name
//
// Restore on a computer running the same operating system:
//         node scripts/run-sql.js backups/<file>.sql --allow-drop
// (--allow-drop is needed because a dump recreates the tables, which run-sql.js refuses on a database with data.)
//
// Note: mysqldump on Windows writes table names in lowercase. Restoring that dump on Linux or macOS
// would not match the uppercase names the code uses. To rebuild the demo on any other machine, use
// `npm run demo:reset` instead; it works everywhere.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const WINDOWS_DEFAULT = 'C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin\\mysqldump.exe';

function findMysqldump() {
    if (process.env.MYSQLDUMP_PATH) return process.env.MYSQLDUMP_PATH;
    if (process.platform === 'win32' && fs.existsSync(WINDOWS_DEFAULT)) return WINDOWS_DEFAULT;
    return 'mysqldump';   // hope it is on PATH
}

const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
const outArg = process.argv.slice(2).find((a) => !a.startsWith('--'));
const outFile = path.resolve(outArg || path.join(__dirname, '..', 'backups', `campusfind_${stamp}.sql`));
fs.mkdirSync(path.dirname(outFile), { recursive: true });

const result = spawnSync(findMysqldump(), [
    '-h', process.env.DB_HOST,
    '-P', String(process.env.DB_PORT),
    '-u', process.env.DB_USER,
    '--single-transaction',
    '--no-tablespaces',
    '--databases', process.env.DB_NAME,
    `--result-file=${outFile}`
], {
    // The password goes in the environment, not on the command line, so it never shows up in process lists.
    env: { ...process.env, MYSQL_PWD: process.env.DB_PASSWORD },
    encoding: 'utf8'
});

if (result.error) {
    console.error(`demo:dump failed: could not run mysqldump (${result.error.message}). Set MYSQLDUMP_PATH in .env if it is installed somewhere else.`);
    process.exit(1);
}
if (result.status !== 0) {
    console.error('demo:dump failed:', (result.stderr || '').trim());
    process.exit(1);
}
console.log(`Backup written: ${outFile} (${fs.statSync(outFile).size} bytes)`);
