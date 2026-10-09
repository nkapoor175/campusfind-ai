// Resets the database to the clean demo dataset.
//
// Usage:  npm run demo:reset              shows what will be erased, asks you to type YES
//         npm run demo:reset -- --yes     no question asked (for scripts)
//
// What it does:
//   1. runs sql/schema.sql    (DROPS and recreates all 9 tables: everything in them is erased)
//   2. runs sql/demo-data.sql (students, admin, items, matches, claims, notifications)
//   3. empties uploads/lost and uploads/found, then copies demo/images/* in as the item photos
//
// Safety: it refuses to run unless the database is on this computer (127.0.0.1 / localhost) and is
// named campusfind_ai (schema.sql always uses that name). Pass --allow-remote to override the first rule.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mysql = require('mysql2/promise');

const ROOT = path.join(__dirname, '..');
const SCHEMA_SQL = path.join(ROOT, 'sql', 'schema.sql');
const DEMO_SQL = path.join(ROOT, 'sql', 'demo-data.sql');
const IMAGE_SOURCE = path.join(ROOT, 'demo', 'images');
const UPLOADS = path.join(ROOT, 'uploads');

// Which illustration each seeded item photo uses (the ImageURL rows are in sql/demo-data.sql).
const PHOTOS = [
    { kind: 'lost', id: 1, image: 'bottle.png' },
    { kind: 'lost', id: 2, image: 'earbuds.png' },
    { kind: 'lost', id: 3, image: 'backpack.png' },
    { kind: 'lost', id: 4, image: 'wallet.png' },
    { kind: 'lost', id: 5, image: 'keys.png' },
    { kind: 'lost', id: 6, image: 'umbrella.png' },
    { kind: 'found', id: 1, image: 'bottle.png' },
    { kind: 'found', id: 2, image: 'earbuds.png' },
    { kind: 'found', id: 3, image: 'wallet.png' },
    { kind: 'found', id: 4, image: 'keys.png' }
];
const TABLES = ['STUDENT', 'ADMIN', 'LOST_ITEM', 'LOST_ITEM_IMAGE', 'FOUND_ITEM', 'FOUND_ITEM_IMAGE', 'MATCH_RECORD', 'CLAIM', 'NOTIFICATION'];
const LOCAL_HOSTS = ['127.0.0.1', 'localhost', '::1'];

function fail(message) {
    console.error(`demo:reset stopped: ${message}`);
    process.exit(1);
}

async function currentCounts(conn) {
    try {
        const counts = [];
        for (const table of TABLES) {
            // Table names come from the fixed TABLES list above, never from user input.
            const [[{ n }]] = await conn.query(`SELECT COUNT(*) AS n FROM campusfind_ai.\`${table}\``);
            counts.push(`${table} ${n}`);
        }
        return counts.join(', ');
    } catch (err) {
        return null;   // the database or its tables do not exist yet
    }
}

function ask(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(question, (answer) => { rl.close(); resolve(answer); }));
}

function emptyUploadFolders() {
    let removed = 0;
    for (const folder of ['lost', 'found']) {
        const dir = path.join(UPLOADS, folder);
        fs.mkdirSync(dir, { recursive: true });
        for (const file of fs.readdirSync(dir)) {
            if (file === '.gitkeep') continue;
            fs.unlinkSync(path.join(dir, file));
            removed += 1;
        }
    }
    return removed;
}

async function main() {
    const args = process.argv.slice(2);
    const yes = args.includes('--yes');
    const allowRemote = args.includes('--allow-remote');

    if (process.env.DB_NAME !== 'campusfind_ai') {
        fail(`DB_NAME is "${process.env.DB_NAME}" but sql/schema.sql always uses campusfind_ai. Set DB_NAME=campusfind_ai in .env.`);
    }
    if (!LOCAL_HOSTS.includes(process.env.DB_HOST) && !allowRemote) {
        fail(`DB_HOST is "${process.env.DB_HOST}", which is not on this computer. This command wipes the whole database, so it only runs locally. Pass --allow-remote if you are sure.`);
    }
    for (const file of [SCHEMA_SQL, DEMO_SQL]) {
        if (!fs.existsSync(file)) fail(`missing file ${file}`);
    }
    for (const photo of PHOTOS) {
        if (!fs.existsSync(path.join(IMAGE_SOURCE, photo.image))) fail(`missing demo image demo/images/${photo.image}`);
    }

    // Connect WITHOUT a database selected, so schema.sql can create it if it does not exist yet.
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true
    });

    try {
        const counts = await currentCounts(conn);
        console.log(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT} / campusfind_ai`);
        console.log(counts ? `It currently holds: ${counts}` : 'It is empty or does not exist yet.');
        console.log('This will ERASE all of it and load the demo data.\n');

        if (!yes) {
            if (!process.stdin.isTTY) fail('no terminal to ask for confirmation. Run it in a terminal, or pass --yes.');
            const answer = await ask('Type YES to continue: ');
            if (answer.trim() !== 'YES') fail('cancelled, nothing was changed.');
        }

        await conn.query(fs.readFileSync(SCHEMA_SQL, 'utf8'));
        console.log('1. Recreated the 9 empty tables (sql/schema.sql)');
        await conn.query(fs.readFileSync(DEMO_SQL, 'utf8'));
        console.log('2. Loaded the demo data (sql/demo-data.sql)');

        const removed = emptyUploadFolders();
        for (const photo of PHOTOS) {
            fs.copyFileSync(
                path.join(IMAGE_SOURCE, photo.image),
                path.join(UPLOADS, photo.kind, `demo-${photo.kind}-${photo.id}.png`)
            );
        }
        console.log(`3. Emptied the upload folders (${removed} old file(s) removed) and copied ${PHOTOS.length} demo photos`);

        // Every photo row in the database must have its file on disk.
        const missing = [];
        for (const [table, folder] of [['LOST_ITEM_IMAGE', 'lost'], ['FOUND_ITEM_IMAGE', 'found']]) {
            const [rows] = await conn.query(`SELECT ImageURL FROM campusfind_ai.${table}`);
            for (const { ImageURL } of rows) {
                if (!fs.existsSync(path.join(ROOT, ImageURL))) missing.push(`${ImageURL} (${folder})`);
            }
        }
        if (missing.length > 0) fail(`photo rows without a file on disk: ${missing.join(', ')}`);

        console.log(`\nDone. Now in the database: ${await currentCounts(conn)}`);
        console.log('\nLogins:');
        console.log('  Students (password Demo@12345): navika@, parthvi@, rohan@, aarav@, ishita@, kabir@  (all @campus.edu)');
        console.log('  Admin    (password Admin@12345): admin@campus.edu');
    } finally {
        await conn.end();
    }
}

main().catch((err) => {
    console.error('demo:reset failed:', err.message);
    process.exit(1);
});
