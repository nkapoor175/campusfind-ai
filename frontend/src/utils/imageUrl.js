/**
 * Helper to resolve image paths and extract image URLs from items.
 * Handles data URLs, full HTTP(S) URLs, backend /uploads relative paths, and object schemas.
 */

export function getItemImageUrl(item) {
  if (!item) return null;
  if (typeof item === 'string') return resolveImageUrl(item);
  
  const rawUrl =
    item.imageUrl ||
    item.ImageURL ||
    (Array.isArray(item.images) && item.images[0] && (item.images[0].ImageURL || item.images[0].image_url || (typeof item.images[0] === 'string' ? item.images[0] : null))) ||
    item.photoUrl ||
    item.imagePreview ||
    null;

  return resolveImageUrl(rawUrl);
}

export function resolveImageUrl(url) {
  if (!url || typeof url !== 'string') return null;

  // Already an absolute URL, data URL, or blob URL
  if (
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('http://') ||
    url.startsWith('https://')
  ) {
    return url;
  }

  const apiBase = import.meta.env.VITE_API_URL || '';
  if (url.startsWith('/')) {
    return `${apiBase}${url}`;
  }

  return `${apiBase}/${url}`;
}

/**
 * Context-aware item display image selector:
 * 
 * - context = "listing" -> null
 *   (Strictly returns null so cards on the listing boards always render the cute category illustration,
 *    preserving the cohesive, consistent visual identity of CampusFind AI)
 * 
 * - context = "detail"  -> real uploaded image URL if available, otherwise null
 *   (Displays real uploaded photograph in item detail modal/view)
 * 
 * - context = "match"   -> real uploaded image URL if available, otherwise null
 *   (Displays real uploaded photograph for side-by-side AI match comparison)
 *
 * @param {Object|string} item - The lost or found item
 * @param {'listing' | 'detail' | 'match'} context - Presentation context
 * @returns {string|null} Resolved image URL or null to fall back to category illustration
 */
export function getItemDisplayImage(item, context = 'listing') {
  if (!item) return null;

  // On main listing boards, suppress real photo so category illustrations maintain identity
  if (context === 'listing') {
    return null;
  }

  // In detail views and match comparison views, return real uploaded photo if available
  if (context === 'detail' || context === 'match') {
    return getItemImageUrl(item);
  }

  return getItemImageUrl(item);
}

/**
 * Returns true if the item has an uploaded real photograph attached.
 * Useful for showing a subtle indicator chip on cards without displaying the photo itself.
 */
export function hasUploadedPhoto(item) {
  return Boolean(getItemImageUrl(item));
}

