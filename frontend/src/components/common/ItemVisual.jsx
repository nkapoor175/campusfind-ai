import React, { useState } from 'react';
import { getCategoryIllustration } from '../../assets/illustrations/IllustratedIcons';
import { getItemDisplayImage } from '../../utils/imageUrl';

/**
 * Reusable ItemVisual component.
 *
 * Implements context-aware visual presentation:
 * - context = "listing"  → Cute category illustration (cohesive board aesthetic)
 * - context = "detail"   → Real uploaded photo if available, fallback to category illustration
 * - context = "match"    → Real uploaded photo if available, fallback to category illustration
 *
 * Centralizes all image vs illustration fallback logic so it is NOT duplicated across components.
 */
export default function ItemVisual({
  item,
  context = 'listing',
  size = 76,
  className = '',
  imgClassName = '',
  alt = '',
}) {
  const [imgFailed, setImgFailed] = useState(false);

  const displayImage = !imgFailed ? getItemDisplayImage(item, context) : null;
  const category = item?.Category || item?.category || 'Others';
  const itemName = item?.ItemName || item?.itemName || alt || 'Campus item';

  if (displayImage) {
    return (
      <img
        src={displayImage}
        alt={itemName}
        className={imgClassName || className || 'item-visual-photo'}
        onError={() => setImgFailed(true)}
        loading="lazy"
      />
    );
  }

  return getCategoryIllustration(category, size, className);
}
