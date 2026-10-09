import React from 'react';
import { EmptyBackpackIllustration, CampusMascot } from '../../assets/illustrations/IllustratedIcons';
import Button from './Button';

export default function EmptyState({
  title = 'No items found',
  description = 'Everything seems to be right where it belongs!',
  actionLabel,
  onAction,
  iconType = 'backpack', // 'backpack' | 'mascot'
  size = 'normal',
}) {
  return (
    <div className={`empty-state-wrap empty-${size} fade-in`}>
      <div className="empty-illustration-box animate-float">
        {iconType === 'mascot' ? (
          <CampusMascot size={110} />
        ) : (
          <EmptyBackpackIllustration size={130} />
        )}
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-desc">{description}</p>
      {actionLabel && onAction && (
        <div className="empty-action-wrap">
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}

      <style>{`
        .empty-state-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 3rem 1.5rem;
          margin: 1.5rem auto;
          max-width: 480px;
        }
        .empty-illustration-box {
          margin-bottom: 1.25rem;
          filter: drop-shadow(0 6px 12px rgba(224, 109, 83, 0.08));
        }
        .empty-title {
          font-family: var(--font-display);
          font-size: 1.35rem;
          color: var(--charcoal-900);
          margin-bottom: 0.4rem;
        }
        .empty-desc {
          color: var(--charcoal-600);
          font-size: 0.95rem;
          max-width: 360px;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }
        .empty-action-wrap {
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
}
