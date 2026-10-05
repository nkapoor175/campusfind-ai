import React from 'react';
import { MapPin, Calendar, Tag, Sparkles, User } from 'lucide-react';
import Card from '../common/Card';
import StatusBadge from '../common/StatusBadge';
import { getCategoryIllustration } from '../../assets/illustrations/IllustratedIcons';

export default function ItemCard({
  item,
  type = 'lost', // 'lost' | 'found'
  onClick,
  hasMatch = false,
  matchScore,
}) {
  const isLost = type === 'lost';
  const itemId = isLost ? item.LostID : item.FoundID;
  const dateVal = isLost ? item.DateLost : item.DateFound;
  const locVal = isLost ? item.LostLocation : item.FoundLocation;

  return (
    <Card
      variant="interactive"
      padding="none"
      onClick={() => onClick(item)}
      className="item-card-component fade-in"
    >
      {/* Thumbnail Header Area */}
      <div className="item-card-media">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.ItemName} className="item-card-photo" />
        ) : (
          <div className="item-card-illustration-wrap">
            {getCategoryIllustration(item.Category, 76, 'item-card-svg')}
          </div>
        )}

        {/* Top Badges */}
        <div className="item-card-top-badges">
          <StatusBadge status={item.Status} />
          {hasMatch && (
            <span className="match-pill-indicator animate-soft-pulse">
              <Sparkles size={12} /> {matchScore ? `${Math.round(matchScore * 100)}% Match` : 'Match ✨'}
            </span>
          )}
        </div>
      </div>

      {/* Item Body Content */}
      <div className="item-card-body">
        <div className="item-category-row">
          <span className="item-category-tag">{item.Category || 'General'}</span>
          {item.Color && (
            <span className="item-color-chip" title={`Color: ${item.Color}`}>
              <span className="color-dot" style={{ backgroundColor: getColorHex(item.Color) }} />
              {item.Color}
            </span>
          )}
        </div>

        <h3 className="item-card-title">{item.ItemName}</h3>

        {item.Description && (
          <p className="item-card-desc">{item.Description}</p>
        )}

        <div className="item-card-meta-list">
          {locVal && (
            <div className="meta-row">
              <MapPin size={14} className="meta-icon loc" />
              <span className="meta-text">{locVal}</span>
            </div>
          )}
          {dateVal && (
            <div className="meta-row">
              <Calendar size={14} className="meta-icon date" />
              <span className="meta-text">
                {isLost ? 'Lost on ' : 'Found on '}
                {new Date(dateVal).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="item-card-footer">
        <div className="item-reporter">
          <div className="reporter-avatar">
            {(item.studentName || 'Student').charAt(0)}
          </div>
          <span className="reporter-name">{item.studentName || 'Campus Student'}</span>
        </div>
        <span className="view-details-link">Details &rarr;</span>
      </div>

      <style>{`
        .item-card-component {
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-xl);
          overflow: hidden;
          background: #FFFFFF;
        }
        .item-card-media {
          position: relative;
          width: 100%;
          height: 155px;
          background: linear-gradient(135deg, #FAF7F2, #F8EFE6);
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .item-card-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .item-card-illustration-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform var(--transition-spring);
        }
        .item-card-component:hover .item-card-illustration-wrap {
          transform: scale(1.08) translateY(-3px);
        }
        .item-card-top-badges {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          right: 0.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          pointer-events: none;
        }
        .match-pill-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: #FFF8E7;
          color: #925E12;
          border: 1px solid #E39D38;
          padding: 0.2rem 0.65rem;
          border-radius: var(--radius-pill);
          font-size: 0.75rem;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(227, 157, 56, 0.25);
        }
        .item-card-body {
          padding: 1.15rem 1.25rem 0.75rem 1.25rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          text-align: left;
        }
        .item-category-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.4rem;
        }
        .item-category-tag {
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--coral-500);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .item-color-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.75rem;
          color: var(--charcoal-600);
          background: var(--cream-soft);
          padding: 1px 6px;
          border-radius: var(--radius-pill);
        }
        .color-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.1);
        }
        .item-card-title {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--charcoal-900);
          margin-bottom: 0.35rem;
          line-height: 1.3;
        }
        .item-card-desc {
          font-size: 0.86rem;
          color: var(--charcoal-600);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 0.85rem;
          line-height: 1.45;
        }
        .item-card-meta-list {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .meta-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.82rem;
          color: var(--charcoal-600);
        }
        .meta-icon.loc { color: var(--coral-500); }
        .meta-icon.date { color: var(--sage-500); }
        .meta-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .item-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1.25rem;
          background: var(--cream-soft);
          border-top: 1px solid var(--border-subtle);
          font-size: 0.82rem;
        }
        .item-reporter {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .reporter-avatar {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--peach-400);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
        }
        .reporter-name {
          color: var(--charcoal-800);
          font-weight: 600;
        }
        .view-details-link {
          color: var(--coral-500);
          font-weight: 700;
        }
      `}</style>
    </Card>
  );
}

function getColorHex(colorName = '') {
  const c = colorName.toLowerCase();
  if (c.includes('blue')) return '#5D859A';
  if (c.includes('black')) return '#2C3240';
  if (c.includes('red') || c.includes('coral')) return '#E06D53';
  if (c.includes('green') || c.includes('sage')) return '#6D9775';
  if (c.includes('yellow') || c.includes('gold')) return '#E39D38';
  if (c.includes('white') || c.includes('silver')) return '#E4DACB';
  return '#C9563E';
}
