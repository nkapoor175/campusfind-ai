import React, { useState } from 'react';
import { Sparkles, Check, X, ArrowRight, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import Card from '../common/Card';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import ItemVisual from '../common/ItemVisual';

export default function MatchCard({
  match,
  onConfirm,
  onReject,
  onClaim,
  onViewItem,
  showActions = true,
}) {
  const lost = match.lostItem || {};
  const found = match.foundItem || {};
  const scorePercent = match.score ? Math.round(match.score * 100) : null;

  const getScoreColor = (pct) => {
    if (pct >= 85) return 'var(--sage-500)';
    if (pct >= 65) return 'var(--sunflower-500)';
    return 'var(--coral-500)';
  };

  return (
    <Card variant="default" className="match-card-wrap fade-in">
      {/* Header bar with Sparkle banner */}
      <div className="match-header-row">
        <div className="match-header-left">
          <div className="sparkle-icon-badge">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="match-header-title">AI Match Candidate</h4>
            <span className="match-date-sub">
              {new Date(match.MatchDate || Date.now()).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        <div className="match-score-pill" style={{ borderColor: scorePercent ? getScoreColor(scorePercent) : 'var(--peach-400)' }}>
          {scorePercent !== null ? (
            <>
              <span className="match-score-num" style={{ color: getScoreColor(scorePercent) }}>
                {scorePercent}%
              </span>
              <span className="match-score-label">Confidence</span>
            </>
          ) : (
            <span className="match-score-label" style={{ color: 'var(--coral-500)', fontWeight: 800 }}>
              AI Match ✨
            </span>
          )}
        </div>
      </div>

      {/* Paired Items Comparison Grid */}
      <div className="match-pair-grid">
        {/* Lost Item Side */}
        <div
          className="match-item-box pressable"
          onClick={() => onViewItem && onViewItem(lost, 'lost')}
        >
          <span className="item-role-tag lost">Lost Item #{lost.LostID || match.LostID}</span>
          <div className="match-item-content">
            <div className="match-item-icon">
              <ItemVisual
                item={lost}
                context="match"
                size={46}
                imgClassName="match-thumb-img"
                alt={lost.ItemName}
              />
            </div>
            <div className="match-item-details">
              <h5 className="match-item-name">{lost.ItemName || 'Lost Item'}</h5>
              <p className="match-item-meta">
                <MapPin size={12} /> {lost.LostLocation || 'Unknown'}
              </p>
              <p className="match-item-meta">
                <Calendar size={12} /> {lost.DateLost ? new Date(lost.DateLost).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
              </p>
            </div>
          </div>
        </div>

        {/* Center Connection Indicator */}
        <div className="match-bridge-indicator">
          <div className="bridge-circle">
            <ArrowRight size={18} />
          </div>
        </div>

        {/* Found Item Side */}
        <div
          className="match-item-box pressable"
          onClick={() => onViewItem && onViewItem(found, 'found')}
        >
          <span className="item-role-tag found">Found Item #{found.FoundID || match.FoundID}</span>
          <div className="match-item-content">
            <div className="match-item-icon">
              <ItemVisual
                item={found}
                context="match"
                size={46}
                imgClassName="match-thumb-img"
                alt={found.ItemName}
              />
            </div>
            <div className="match-item-details">
              <h5 className="match-item-name">{found.ItemName || 'Found Item'}</h5>
              <p className="match-item-meta">
                <MapPin size={12} /> {found.FoundLocation || 'Unknown'}
              </p>
              <p className="match-item-meta">
                <Calendar size={12} /> {found.DateFound ? new Date(found.DateFound).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Criteria Pills */}
      <div className="match-breakdown-row">
        <span className="criteria-pill matched">
          <CheckCircle2 size={12} /> Category: {found.Category || lost.Category}
        </span>
        {found.Color && lost.Color && (
          <span className="criteria-pill matched">
            <CheckCircle2 size={12} /> Color: {found.Color}
          </span>
        )}
        <span className="criteria-pill">
          Proximity: Same Campus Zone
        </span>
        <div style={{ marginLeft: 'auto' }}>
          <StatusBadge status={match.MatchStatus || 'Pending'} />
        </div>
      </div>

      {/* Actions Row */}
      {showActions && (
        <div className="match-actions-footer">
          {match.MatchStatus === 'Confirmed' ? (
            <div className="confirmed-note">
              <CheckCircle2 size={16} /> Match Confirmed — Proceed to Security for Claim Pickup
            </div>
          ) : (
            <>
              {onClaim && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onClaim(match)}
                >
                  Claim This Found Item
                </Button>
              )}
              {onConfirm && (
                <Button
                  variant="sage"
                  size="sm"
                  icon={Check}
                  onClick={() => onConfirm(match)}
                >
                  Confirm Match
                </Button>
              )}
              {onReject && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={X}
                  onClick={() => onReject(match)}
                >
                  Not Mine
                </Button>
              )}
            </>
          )}
        </div>
      )}

      <style>{`
        .match-card-wrap {
          border-left: 5px solid var(--peach-500);
          background: #FFFFFF;
          margin-bottom: 1.25rem;
          padding: 1.25rem;
        }
        .match-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .match-header-left {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .sparkle-icon-badge {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--peach-200);
          color: #934612;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .match-header-title {
          font-family: var(--font-display);
          font-size: 1.05rem;
          margin: 0;
          color: var(--charcoal-900);
        }
        .match-date-sub {
          font-size: 0.76rem;
          color: var(--charcoal-400);
        }
        .match-score-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #FFFDF9;
          border: 1.5px solid;
          border-radius: var(--radius-md);
          padding: 0.25rem 0.75rem;
          box-shadow: var(--shadow-sm);
        }
        .match-score-num {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 800;
          line-height: 1;
        }
        .match-score-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--charcoal-400);
          text-transform: uppercase;
        }
        .match-pair-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          background: var(--cream-soft);
          border-radius: var(--radius-lg);
          padding: 1rem;
        }
        .match-item-box {
          background: #FFFFFF;
          border: 1px solid var(--border-warm);
          border-radius: var(--radius-md);
          padding: 0.75rem 0.85rem;
          text-align: left;
        }
        .item-role-tag {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: var(--radius-pill);
          margin-bottom: 0.4rem;
        }
        .item-role-tag.lost {
          background: var(--coral-100);
          color: var(--coral-600);
        }
        .item-role-tag.found {
          background: var(--sage-100);
          color: var(--sage-600);
        }
        .match-item-content {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .match-item-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .match-thumb-img {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          object-fit: cover;
          border: 1px solid var(--border-warm);
        }
        .match-item-details {
          overflow: hidden;
        }
        .match-item-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--charcoal-900);
          margin-bottom: 0.2rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .match-item-meta {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.76rem;
          color: var(--charcoal-600);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .match-bridge-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bridge-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--peach-200);
          color: #934612;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .match-breakdown-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .criteria-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.76rem;
          font-weight: 600;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-pill);
          background: #FFFFFF;
          border: 1px solid var(--border-warm);
          color: var(--charcoal-600);
        }
        .criteria-pill.matched {
          background: var(--sage-100);
          color: var(--sage-600);
          border-color: rgba(109, 151, 117, 0.3);
        }
        .match-actions-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.5rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-subtle);
        }
        .confirmed-note {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--sage-600);
          font-weight: 600;
          font-size: 0.88rem;
        }
        @media (max-width: 680px) {
          .match-pair-grid {
            grid-template-columns: 1fr;
          }
          .match-bridge-indicator {
            transform: rotate(90deg);
          }
        }
      `}</style>
    </Card>
  );
}
