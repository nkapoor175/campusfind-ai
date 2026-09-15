const TEXT_SIMILARITY_URL = process.env.TEXT_SIMILARITY_URL || 'http://localhost:8000/similarity';
const TEXT_SIMILARITY_TIMEOUT_MS = 2000;

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
async function scoreMatch(lostItem, foundItem) {
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

module.exports = { scoreMatch, stubScore };
