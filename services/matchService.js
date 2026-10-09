const fs = require('fs/promises');
const path = require('path');
const pool = require('../config/db');

const TEXT_SIMILARITY_URL = process.env.TEXT_SIMILARITY_URL || 'http://localhost:8000/similarity';
const TEXT_SIMILARITY_TIMEOUT_MS = 2000;

const ML_SIMILARITY_URL = (process.env.ML_SIMILARITY_URL || 'http://localhost:8001').replace(/\/+$/, '');
const parsedTimeout = parseInt(process.env.ML_TIMEOUT_MS, 10);
const ML_TIMEOUT_MS = parsedTimeout > 0 ? parsedTimeout : 8000;

// How much the image score counts when both items have a photo (0 = ignore photos, 1 = photos only).
const parsedWeight = parseFloat(process.env.IMAGE_WEIGHT);
const IMAGE_WEIGHT = Number.isNaN(parsedWeight) ? 0.4 : Math.min(1, Math.max(0, parsedWeight));

// Image comparison is the slow part, so batches only run it for the best text matches.
const IMAGE_CANDIDATES = 5;

const UPLOADS_DIR = path.resolve(__dirname, '..', 'uploads');
const MIME_TYPES = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
};

// Stub scorer: weighted exact/partial string comparison on category/brand/color + naive word-overlap on description.
// This is the placeholder used until the Python TF-IDF/cosine service is wired in (or whenever it's unreachable).
const WEIGHTS = { category: 0.3, brand: 0.3, color: 0.2, description: 0.2 };

function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
}

function fieldScore(a, b) {
    const na = normalize(a);
    const nb = normalize(b);
    if (!na || !nb) return 0;
    if (na === nb) return 1;
    return na.includes(nb) || nb.includes(na) ? 0.5 : 0;
}

function descriptionScore(a, b) {
    const wordsA = new Set(normalize(a).split(/\s+/).filter(Boolean));
    const wordsB = new Set(normalize(b).split(/\s+/).filter(Boolean));
    if (wordsA.size === 0 || wordsB.size === 0) return 0;

    let overlap = 0;
    for (const word of wordsA) {
        if (wordsB.has(word)) overlap += 1;
    }
    return overlap / Math.max(wordsA.size, wordsB.size);
}

function stubScore(lostItem, foundItem) {
    const score =
        WEIGHTS.category * fieldScore(lostItem.Category, foundItem.Category) +
        WEIGHTS.brand * fieldScore(lostItem.Brand, foundItem.Brand) +
        WEIGHTS.color * fieldScore(lostItem.Color, foundItem.Color) +
        WEIGHTS.description * descriptionScore(lostItem.Description, foundItem.Description);

    return Math.round(score * 100) / 100;
}

// Calls the Python text-similarity microservice; falls back to the local stub scorer
// if the service is unreachable, slow, or errors out, so matching never hard-fails.
async function scoreText(lostItem, foundItem) {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TEXT_SIMILARITY_TIMEOUT_MS);

        const response = await fetch(TEXT_SIMILARITY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lost: {
                    category: lostItem.Category,
                    brand: lostItem.Brand,
                    color: lostItem.Color,
                    description: lostItem.Description
                },
                found: {
                    category: foundItem.Category,
                    brand: foundItem.Brand,
                    color: foundItem.Color,
                    description: foundItem.Description
                }
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`Text similarity service responded with ${response.status}`);
        }

        const data = await response.json();
        if (typeof data.score !== 'number') {
            throw new Error('Text similarity service returned an unexpected payload');
        }

        return data.score;
    } catch (err) {
        console.warn('Text similarity service unavailable, falling back to stub scorer:', err.message);
        return stubScore(lostItem, foundItem);
    }
}

// Reads an item's first photo from disk. Returns null when the item has no photo, the stored
// URL isn't one of our own /uploads files (e.g. a remote URL), or the file is missing.
async function readFirstImage(kind, id) {
    const sql = kind === 'lost'
        ? 'SELECT ImageURL FROM LOST_ITEM_IMAGE WHERE LostID = ? ORDER BY ImageURL LIMIT 1'
        : 'SELECT ImageURL FROM FOUND_ITEM_IMAGE WHERE FoundID = ? ORDER BY ImageURL LIMIT 1';
    const [rows] = await pool.query(sql, [id]);
    if (rows.length === 0) return null;

    const imageUrl = rows[0].ImageURL;
    if (!imageUrl.startsWith('/uploads/')) return null;

    const filePath = path.resolve(__dirname, '..', '.' + imageUrl);
    if (!filePath.startsWith(UPLOADS_DIR + path.sep)) return null;

    try {
        const data = await fs.readFile(filePath);
        const type = MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
        return { data, type, name: path.basename(filePath) };
    } catch (err) {
        return null;
    }
}

// Photo similarity from the Python image service, as 0 to 1 (the service answers 0 to 100).
// Returns null if either item has no usable photo or the service is down, slow or failing.
// Never throws.
async function scoreImages(lostItem, foundItem) {
    try {
        const [lostImage, foundImage] = await Promise.all([
            readFirstImage('lost', lostItem.LostID),
            readFirstImage('found', foundItem.FoundID)
        ]);
        if (!lostImage || !foundImage) return null;

        const form = new FormData();
        form.append('image1', new Blob([lostImage.data], { type: lostImage.type }), lostImage.name);
        form.append('image2', new Blob([foundImage.data], { type: foundImage.type }), foundImage.name);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), ML_TIMEOUT_MS);
        let response;
        try {
            response = await fetch(`${ML_SIMILARITY_URL}/compare-images`, {
                method: 'POST',
                body: form,
                signal: controller.signal
            });
        } finally {
            clearTimeout(timeout);
        }

        if (!response.ok) {
            throw new Error(`Image similarity service responded with ${response.status}`);
        }

        const data = await response.json();
        if (typeof data.similarityScore !== 'number') {
            throw new Error('Image similarity service returned an unexpected payload');
        }

        return Math.round(Math.min(1, Math.max(0, data.similarityScore / 100)) * 100) / 100;
    } catch (err) {
        console.warn('Image similarity unavailable, using text score only:', err.message);
        return null;
    }
}

// With a photo score the final score blends both; without one it is just the text score.
function combineScores(textScore, imageScore) {
    if (imageScore === null) return textScore;
    return Math.round(((1 - IMAGE_WEIGHT) * textScore + IMAGE_WEIGHT * imageScore) * 100) / 100;
}

async function scoreMatchDetailed(lostItem, foundItem) {
    const [textScore, imageScore] = await Promise.all([
        scoreText(lostItem, foundItem),
        scoreImages(lostItem, foundItem)
    ]);
    return { score: combineScores(textScore, imageScore), textScore, imageScore };
}

// Plain 0 to 1 number for callers that only need the final score.
async function scoreMatch(lostItem, foundItem) {
    return (await scoreMatchDetailed(lostItem, foundItem)).score;
}

// Scores many {lost, found} pairs at once: text for every pair, but image similarity only
// for the IMAGE_CANDIDATES pairs with the best text score. Results line up with `pairs`.
async function scorePairs(pairs) {
    const textScores = await Promise.all(pairs.map(({ lost, found }) => scoreText(lost, found)));

    const bestByText = pairs
        .map((_, index) => index)
        .sort((a, b) => textScores[b] - textScores[a])
        .slice(0, IMAGE_CANDIDATES);

    const imageScores = new Array(pairs.length).fill(null);
    await Promise.all(
        bestByText.map(async (index) => {
            imageScores[index] = await scoreImages(pairs[index].lost, pairs[index].found);
        })
    );

    return pairs.map((_, index) => ({
        score: combineScores(textScores[index], imageScores[index]),
        textScore: textScores[index],
        imageScore: imageScores[index]
    }));
}

module.exports = { scoreMatch, scoreMatchDetailed, scorePairs, scoreImages, stubScore };
