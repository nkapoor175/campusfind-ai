import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Tag, User, ShieldCheck, Sparkles, AlertCircle, CheckCircle2, Send } from 'lucide-react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import { getCategoryIllustration } from '../../assets/illustrations/IllustratedIcons';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function ItemDetailModal({
  isOpen,
  onClose,
  item,
  type = 'lost', // 'lost' | 'found'
  onClaimSubmitted,
}) {
  const { user, role } = useAuth();
  const toast = useToast();
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const isLost = type === 'lost';
  const itemId = item ? (isLost ? item.LostID : item.FoundID) : null;
  const dateVal = item ? (isLost ? item.DateLost : item.DateFound) : null;
  const locVal = item ? (isLost ? item.LostLocation : item.FoundLocation) : null;

  useEffect(() => {
    if (isOpen && item && isLost) {
      setLoadingCandidates(true);
      api.getCandidates(item.LostID)
        .then((cand) => {
          setCandidates(cand || []);
        })
        .catch(() => {
          setCandidates([]);
        })
        .finally(() => setLoadingCandidates(false));
    } else {
      setCandidates([]);
    }
  }, [isOpen, item, isLost]);

  if (!item) return null;

  const handleFileClaim = async () => {
    if (!user) {
      toast.error('Please login to file a claim');
      return;
    }
    setClaimLoading(true);
    try {
      await api.createClaim(user.StudentID || 2, item.FoundID);
      setClaimSuccess(true);
      toast.success('Ownership claim submitted to campus security!');
      if (onClaimSubmitted) onClaimSubmitted();
    } catch (err) {
      toast.error(err.message || 'Failed to submit claim');
    } finally {
      setClaimLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item.ItemName}
      subtitle={`${isLost ? 'Lost Item Report' : 'Found Item Report'} #${itemId}`}
      maxWidth="680px"
    >
      <div className="item-detail-content">
        {/* Large Media Hero */}
        <div className="detail-media-wrap">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.ItemName} className="detail-photo" />
          ) : (
            <div className="detail-illustration-box">
              {getCategoryIllustration(item.Category, 120)}
            </div>
          )}
          <div className="detail-status-overlay">
            <StatusBadge status={item.Status} size="lg" />
            {item.AdminID && (
              <span className="badge badge-sage">
                <ShieldCheck size={14} /> Admin Verified
              </span>
            )}
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="detail-specs-grid">
          <div className="spec-card">
            <span className="spec-label">Category</span>
            <span className="spec-val">{item.Category || 'General Item'}</span>
          </div>
          <div className="spec-card">
            <span className="spec-label">Brand / Make</span>
            <span className="spec-val">{item.Brand || 'Unspecified'}</span>
          </div>
          <div className="spec-card">
            <span className="spec-label">Primary Color</span>
            <span className="spec-val">{item.Color || 'Unspecified'}</span>
          </div>
          <div className="spec-card">
            <span className="spec-label">{isLost ? 'Date Lost' : 'Date Found'}</span>
            <span className="spec-val">
              {dateVal ? new Date(dateVal).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }) : 'Recent'}
            </span>
          </div>
        </div>

        {/* Location & Description */}
        <div className="detail-info-block">
          <h4 className="block-title">Campus Location</h4>
          <p className="loc-text">
            <MapPin size={16} className="loc-pin" /> {locVal || 'Campus grounds'}
          </p>
        </div>

        {item.Description && (
          <div className="detail-info-block">
            <h4 className="block-title">Description &amp; Marks</h4>
            <p className="desc-text">{item.Description}</p>
          </div>
        )}

        {/* Reporter info */}
        <div className="detail-reporter-bar">
          <div className="reporter-avatar-lg">
            {(item.studentName || 'Student').charAt(0)}
          </div>
          <div>
            <span className="reporter-label">Reported by</span>
            <p className="reporter-name-text">{item.studentName || 'Campus Student'}</p>
          </div>
        </div>

        {/* Possible Match ✨ Section (For Lost Items) */}
        {isLost && (
          <div className="matches-section-wrap">
            <div className="matches-header">
              <div className="sparkle-badge">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="matches-title">Possible Match ✨</h4>
                <p className="matches-subtitle">
                  AI-evaluated similarity with open found items on campus
                </p>
              </div>
            </div>

            {loadingCandidates ? (
              <p className="loading-text">Computing live AI similarity scores...</p>
            ) : candidates.length > 0 ? (
              <div className="candidate-list">
                {candidates.slice(0, 2).map((cand, idx) => {
                  const matchPct = Math.round((cand.score || 0.7) * 100);
                  const fItem = cand.foundItem;
                  return (
                    <div key={idx} className="candidate-card fade-in">
                      <div className="cand-thumb">
                        {getCategoryIllustration(fItem.Category, 46)}
                      </div>
                      <div className="cand-info">
                        <div className="cand-title-row">
                          <h5 className="cand-name">{fItem.ItemName}</h5>
                          <span className="cand-score-pill">
                            {matchPct}% Match
                          </span>
                        </div>
                        <p className="cand-desc">{fItem.Description}</p>
                        <div className="cand-meta">
                          <span><MapPin size={12} /> {fItem.FoundLocation}</span>
                          <span><Calendar size={12} /> {fItem.DateFound}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-matches-box">
                <AlertCircle size={18} className="no-match-icon" />
                <p>No high-confidence matches found yet. We will alert you when a similar item is reported!</p>
              </div>
            )}
          </div>
        )}

        {/* Found Item Claim Action (For Found Items) */}
        {!isLost && item.Status === 'Open' && (
          <div className="claim-action-box">
            {claimSuccess ? (
              <div className="claim-success-banner">
                <CheckCircle2 size={20} />
                <div>
                  <strong>Claim Submitted Successfully!</strong>
                  <p>Visit Campus Security with your student ID to verify ownership and collect your item.</p>
                </div>
              </div>
            ) : (
              <div className="claim-prompt-row">
                <div>
                  <h4 className="claim-prompt-title">Is this your item?</h4>
                  <p className="claim-prompt-desc">Submit an ownership claim to notify campus security for verification.</p>
                </div>
                <Button
                  variant="primary"
                  icon={Send}
                  loading={claimLoading}
                  onClick={handleFileClaim}
                >
                  Claim This Item
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .item-detail-content {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          text-align: left;
        }
        .detail-media-wrap {
          position: relative;
          width: 100%;
          height: 220px;
          border-radius: var(--radius-lg);
          background: linear-gradient(135deg, #FAF7F2, #F8EFE6);
          border: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .detail-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .detail-status-overlay {
          position: absolute;
          top: 1rem;
          left: 1rem;
          right: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .detail-specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 0.75rem;
        }
        .spec-card {
          background: var(--cream-soft);
          border: 1px solid var(--border-warm);
          border-radius: var(--radius-md);
          padding: 0.65rem 0.85rem;
        }
        .spec-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--charcoal-400);
          text-transform: uppercase;
          margin-bottom: 0.15rem;
        }
        .spec-val {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--charcoal-900);
        }
        .detail-info-block {
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.95rem 1.15rem;
        }
        .block-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--charcoal-400);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.35rem;
        }
        .loc-text {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--charcoal-900);
          margin: 0;
        }
        .loc-pin {
          color: var(--coral-500);
        }
        .desc-text {
          font-size: 0.92rem;
          color: var(--charcoal-800);
          line-height: 1.5;
          margin: 0;
        }
        .detail-reporter-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--cream-soft);
          border-radius: var(--radius-md);
          padding: 0.75rem 1rem;
        }
        .reporter-avatar-lg {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--peach-400);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1rem;
        }
        .reporter-label {
          font-size: 0.72rem;
          color: var(--charcoal-400);
          text-transform: uppercase;
          font-weight: 700;
        }
        .reporter-name-text {
          font-weight: 700;
          color: var(--charcoal-900);
          margin: 0;
          font-size: 0.92rem;
        }
        .matches-section-wrap {
          background: #FFFDF9;
          border: 2px solid var(--peach-200);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
        }
        .matches-header {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 1rem;
        }
        .sparkle-badge {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--peach-200);
          color: #934612;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .matches-title {
          font-family: var(--font-display);
          font-size: 1.1rem;
          color: var(--charcoal-900);
          margin: 0;
        }
        .matches-subtitle {
          font-size: 0.78rem;
          color: var(--charcoal-400);
          margin: 0;
        }
        .candidate-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .candidate-card {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          background: #FFFFFF;
          border: 1px solid var(--border-warm);
          border-radius: var(--radius-md);
          padding: 0.85rem;
        }
        .cand-thumb {
          flex-shrink: 0;
        }
        .cand-info {
          flex: 1;
        }
        .cand-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.2rem;
        }
        .cand-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--charcoal-900);
          margin: 0;
        }
        .cand-score-pill {
          font-size: 0.75rem;
          font-weight: 700;
          color: #934612;
          background: var(--peach-200);
          padding: 0.15rem 0.55rem;
          border-radius: var(--radius-pill);
        }
        .cand-desc {
          font-size: 0.82rem;
          color: var(--charcoal-600);
          margin-bottom: 0.35rem;
          line-height: 1.4;
        }
        .cand-meta {
          display: flex;
          gap: 0.75rem;
          font-size: 0.74rem;
          color: var(--charcoal-400);
        }
        .cand-meta span {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }
        .no-matches-box {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 0.85rem;
          color: var(--charcoal-600);
          background: var(--cream-soft);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
        }
        .no-match-icon {
          color: var(--peach-500);
          flex-shrink: 0;
        }
        .claim-action-box {
          background: #FFFFFF;
          border: 1.5px solid var(--border-warm);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
        }
        .claim-prompt-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .claim-prompt-title {
          font-family: var(--font-display);
          font-size: 1.05rem;
          color: var(--charcoal-900);
          margin-bottom: 0.2rem;
        }
        .claim-prompt-desc {
          font-size: 0.84rem;
          color: var(--charcoal-600);
          margin: 0;
        }
        .claim-success-banner {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          color: var(--sage-600);
          background: var(--sage-100);
          padding: 0.95rem 1.15rem;
          border-radius: var(--radius-md);
        }
        .claim-success-banner p {
          font-size: 0.82rem;
          color: var(--charcoal-600);
          margin: 0.2rem 0 0 0;
        }
      `}</style>
    </Modal>
  );
}
