import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  Tag,
  User,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Send,
  Camera,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers
} from 'lucide-react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import ItemVisual from '../common/ItemVisual';
import { getItemImageUrl } from '../../utils/imageUrl';
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
  const { user } = useAuth();
  const toast = useToast();

  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // Claim states for viewing a found item
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  // Claim states for claiming a matched found item from lost view
  const [matchedClaimLoading, setMatchedClaimLoading] = useState(false);
  const [matchedClaimSuccess, setMatchedClaimSuccess] = useState(false);

  // Image similarity evaluation states
  const [imageSimilarity, setImageSimilarity] = useState(null);
  const [comparingImages, setComparingImages] = useState(false);
  const [mlStatus, setMlStatus] = useState(null);
  const [showAiDetails, setShowAiDetails] = useState(false);

  const isLost = type === 'lost';
  const itemId = item ? (isLost ? item.LostID : item.FoundID) : null;
  const dateVal = item ? (isLost ? item.DateLost : item.DateFound) : null;
  const locVal = item ? (isLost ? item.LostLocation : item.FoundLocation) : null;

  const resolvedHeroImage = !heroImgFailed ? getItemImageUrl(item) : null;

  useEffect(() => {
    setHeroImgFailed(false);
    setClaimSuccess(false);
    setMatchedClaimSuccess(false);
    setImageSimilarity(null);
    setShowAiDetails(false);

    if (isOpen && item && isLost) {
      setLoadingCandidates(true);
      
      // Check ML service health in background
      api.checkMlHealth().then((health) => {
        setMlStatus(health);
      }).catch(() => setMlStatus({ status: 'offline' }));

      // Fetch candidates
      api.getCandidates(item.LostID)
        .then(async (cand) => {
          const list = cand || [];
          setCandidates(list);

          // If top candidate exists and both have images, attempt image similarity if available
          if (list.length > 0) {
            const top = list[0];
            const lostImg = getItemImageUrl(item);
            const foundImg = getItemImageUrl(top.foundItem);

            if (lostImg && foundImg) {
              setComparingImages(true);
              try {
                const mlRes = await api.compareImages(lostImg, foundImg);
                if (mlRes && mlRes.available) {
                  setImageSimilarity(mlRes);
                } else {
                  setImageSimilarity({ available: false, reason: mlRes?.reason });
                }
              } catch (err) {
                setImageSimilarity({ available: false, reason: err.message });
              } finally {
                setComparingImages(false);
              }
            }
          }
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

  // Direct claim on found item being viewed
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

  // Claim on candidate found item matched from lost view
  const handleClaimMatchedFound = async (foundId) => {
    if (!user) {
      toast.error('Please login to file a claim');
      return;
    }
    setMatchedClaimLoading(true);
    try {
      await api.createClaim(user.StudentID || 2, foundId);
      setMatchedClaimSuccess(true);
      toast.success('Ownership claim submitted to campus security for matched item!');
      if (onClaimSubmitted) onClaimSubmitted();
    } catch (err) {
      toast.error(err.message || 'Failed to submit claim');
    } finally {
      setMatchedClaimLoading(false);
    }
  };

  const topCand = candidates.length > 0 ? candidates[0] : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item.ItemName}
      subtitle={`${isLost ? 'Lost Item Report' : 'Found Item Report'} #${itemId}`}
      maxWidth="720px"
    >
      <div className="item-detail-content">
        {/* Large Media Hero: Real Photo mode or Cute Illustration mode */}
        <div className={`detail-media-wrap ${resolvedHeroImage ? 'has-photo' : 'has-illustration'}`}>
          {resolvedHeroImage ? (
            <div className="detail-photo-container">
              <ItemVisual
                item={item}
                context="detail"
                size={120}
                imgClassName="detail-photo"
                alt={item.ItemName}
              />
              <span className="detail-photo-badge">
                <Camera size={13} /> Real Item Photograph
              </span>
            </div>
          ) : (
            <div className="detail-illustration-box">
              <ItemVisual
                item={item}
                context="detail"
                size={120}
                alt={item.ItemName}
              />
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
              {dateVal
                ? new Date(dateVal).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recent'}
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

        {/* ==================================================
            AI MATCH PRESENTATION (For Lost Items)
            ================================================== */}
        {isLost && (
          <div className="matches-section-wrap">
            <div className="matches-header">
              <div className="sparkle-badge animate-soft-pulse">
                <Sparkles size={18} />
              </div>
              <div className="matches-header-copy">
                <h4 className="matches-title">Possible Match ✨</h4>
                <p className="matches-subtitle">
                  CampusFind found something that looks similar!
                </p>
              </div>

              {/* Confidence Score Block (ONLY uses actual backend/ML responses) */}
              {topCand && (
                <div className="match-score-indicator">
                  {imageSimilarity?.similarityScore !== undefined && imageSimilarity?.similarityScore !== null ? (
                    <div className="score-pill-box vision-active">
                      <span className="score-number">
                        {Math.round(imageSimilarity.similarityScore)}%
                      </span>
                      <span className="score-label">AI similarity</span>
                    </div>
                  ) : topCand.score ? (
                    <div className="score-pill-box attribute-active">
                      <span className="score-number">
                        {Math.round(topCand.score * 100)}%
                      </span>
                      <span className="score-label">Match Score</span>
                    </div>
                  ) : (
                    <span className="score-fallback-badge">
                      Image comparison available
                    </span>
                  )}
                </div>
              )}
            </div>

            {loadingCandidates ? (
              <div className="loading-match-state">
                <div className="match-spinner" />
                <p className="loading-text">Computing live AI candidate matching...</p>
              </div>
            ) : topCand ? (
              <div className="ai-match-showcase fade-in">
                {/* Visual Treatment: [REAL LOST ITEM IMAGE] → AI MATCH → [REAL FOUND ITEM IMAGE] */}
                <div className="match-visual-bridge-row">
                  {/* Left: Lost Item */}
                  <div className="match-item-column lost-column">
                    <span className="item-role-pill lost">Lost Report</span>
                    <div className="match-photo-frame">
                      <ItemVisual
                        item={item}
                        context="match"
                        size={64}
                        imgClassName="match-real-img"
                        alt={item.ItemName}
                      />
                    </div>
                    <div className="match-item-meta-info">
                      <h5 className="match-item-name">{item.ItemName}</h5>
                      <span className="match-item-cat">{item.Category || 'General'}</span>
                      <p className="match-item-loc">
                        <MapPin size={11} /> {locVal}
                      </p>
                    </div>
                  </div>

                  {/* Center: AI Match Connection Bridge */}
                  <div className="match-connection-bridge">
                    <div className="ai-bridge-circle animate-soft-pulse">
                      <Sparkles size={20} />
                    </div>
                    <span className="bridge-title">AI MATCH</span>
                    <span className="bridge-caption">These items may be the same object.</span>

                    {/* Image comparison status chip */}
                    <div className="vision-status-chip">
                      {comparingImages ? (
                        <span className="status-evaluating">Evaluating visual features...</span>
                      ) : imageSimilarity?.similarityScore !== undefined ? (
                        <span className="status-evaluated">
                          ✓ Visual Match: {Math.round(imageSimilarity.similarityScore)}% ({imageSimilarity.confidence})
                        </span>
                      ) : (
                        <span className="status-available">Image comparison available</span>
                      )}
                    </div>
                  </div>

                  {/* Right: Found Item */}
                  <div className="match-item-column found-column">
                    <span className="item-role-pill found">Found Report</span>
                    <div className="match-photo-frame">
                      <ItemVisual
                        item={topCand.foundItem}
                        context="match"
                        size={64}
                        imgClassName="match-real-img"
                        alt={topCand.foundItem.ItemName}
                      />
                    </div>
                    <div className="match-item-meta-info">
                      <h5 className="match-item-name">{topCand.foundItem.ItemName}</h5>
                      <span className="match-item-cat">{topCand.foundItem.Category || 'General'}</span>
                      <p className="match-item-loc">
                        <MapPin size={11} /> {topCand.foundItem.FoundLocation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Finder's Description Note */}
                {topCand.foundItem.Description && (
                  <div className="match-finder-note">
                    <strong>Finder’s note:</strong> “{topCand.foundItem.Description}”
                  </div>
                )}

                {/* Match Action Footer: Claim this found item */}
                <div className="match-action-footer">
                  <button
                    type="button"
                    className="ai-details-toggle pressable"
                    onClick={() => setShowAiDetails(!showAiDetails)}
                  >
                    {showAiDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {showAiDetails ? 'Hide AI Details' : 'AI Details & Confidence'}
                  </button>

                  <div className="match-cta-actions">
                    {matchedClaimSuccess ? (
                      <div className="matched-claimed-badge">
                        <CheckCircle2 size={16} /> Claim Submitted to Security!
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        icon={Send}
                        loading={matchedClaimLoading}
                        onClick={() => handleClaimMatchedFound(topCand.foundItem.FoundID)}
                      >
                        Claim This Matched Item
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expandable Technical AI Details */}
                {showAiDetails && (
                  <div className="ai-technical-panel fade-in">
                    <div className="tech-row">
                      <span className="tech-label">Candidate Match Score:</span>
                      <span className="tech-val">
                        {topCand.score ? `${Math.round(topCand.score * 100)}% (Multi-attribute match)` : 'Computed live'}
                      </span>
                    </div>
                    <div className="tech-row">
                      <span className="tech-label">Vision ML Service:</span>
                      <span className="tech-val">
                        {imageSimilarity?.similarityScore !== undefined
                          ? `${imageSimilarity.similarityScore.toFixed(1)}% cosine similarity (${imageSimilarity.confidence} confidence)`
                          : mlStatus?.status === 'ok'
                          ? `Ready (${mlStatus.engine || 'FastAPI Service'})`
                          : 'Image comparison available via standalone ml-service'}
                      </span>
                    </div>
                    <div className="tech-row">
                      <span className="tech-label">Database Schema Rule:</span>
                      <span className="tech-val">
                        Match derived at query-time (never permanently stored in schema)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-matches-box">
                <AlertCircle size={18} className="no-match-icon" />
                <p>No candidate matches found yet. We will alert you the moment a similar item is turned in!</p>
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

        /* ──── Detail Hero Media ──── */
        .detail-media-wrap {
          position: relative;
          width: 100%;
          height: 240px;
          border-radius: var(--radius-lg);
          background: linear-gradient(135deg, #FAF7F2, #F8EFE6);
          border: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .detail-photo-container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .detail-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .detail-photo-badge {
          position: absolute;
          bottom: 0.75rem;
          right: 0.75rem;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(30, 34, 45, 0.7);
          backdrop-filter: blur(4px);
          color: #FFFFFF;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-pill);
          font-size: 0.75rem;
          font-weight: 600;
        }
        .detail-illustration-box {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .detail-status-overlay {
          position: absolute;
          top: 1rem;
          left: 1rem;
          right: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          pointer-events: none;
        }

        /* ──── Specs Grid ──── */
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

        /* ──── Info Blocks ──── */
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

        /* ──── Reporter ──── */
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

        /* ──── AI Match Section ──── */
        .matches-section-wrap {
          background: #FFFDF9;
          border: 2px solid var(--peach-200);
          border-radius: var(--radius-xl);
          padding: 1.35rem;
          box-shadow: var(--shadow-sm);
        }
        .matches-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.15rem;
        }
        .sparkle-badge {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--peach-200);
          color: #934612;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .matches-header-copy {
          flex: 1;
        }
        .matches-title {
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--charcoal-900);
          margin: 0;
        }
        .matches-subtitle {
          font-size: 0.82rem;
          color: var(--charcoal-600);
          margin: 0;
        }

        /* Confidence pills */
        .match-score-indicator {
          flex-shrink: 0;
        }
        .score-pill-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          border-radius: var(--radius-md);
          padding: 0.35rem 0.85rem;
          background: #FFFFFF;
          border: 1.5px solid;
          box-shadow: var(--shadow-sm);
        }
        .score-pill-box.vision-active {
          border-color: var(--sage-500);
          background: #F0F8F2;
        }
        .score-pill-box.vision-active .score-number {
          color: var(--sage-600);
        }
        .score-pill-box.attribute-active {
          border-color: var(--coral-500);
          background: #FFF6F4;
        }
        .score-pill-box.attribute-active .score-number {
          color: var(--coral-500);
        }
        .score-number {
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 800;
          line-height: 1;
        }
        .score-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--charcoal-600);
          text-transform: uppercase;
        }
        .score-fallback-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: #934612;
          background: var(--peach-200);
          padding: 0.3rem 0.65rem;
          border-radius: var(--radius-pill);
        }

        /* ──── Side by side Match Bridge ──── */
        .ai-match-showcase {
          background: #FFFFFF;
          border: 1px solid var(--border-warm);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
        }
        .match-visual-bridge-row {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .match-item-column {
          background: var(--cream-soft);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.85rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .item-role-pill {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
          margin-bottom: 0.65rem;
        }
        .item-role-pill.lost {
          background: var(--coral-100);
          color: var(--coral-600);
        }
        .item-role-pill.found {
          background: var(--sage-100);
          color: var(--sage-600);
        }
        .match-photo-frame {
          width: 100%;
          height: 125px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: #FFFFFF;
          border: 1px solid var(--border-warm);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.65rem;
        }
        .match-real-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .match-illus-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .match-item-meta-info {
          text-align: center;
          width: 100%;
        }
        .match-item-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--charcoal-900);
          margin-bottom: 0.15rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .match-item-cat {
          font-size: 0.76rem;
          font-weight: 600;
          color: var(--charcoal-600);
          display: block;
          margin-bottom: 0.2rem;
        }
        .match-item-loc {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.74rem;
          color: var(--charcoal-400);
          margin: 0;
        }

        /* Bridge in Center */
        .match-connection-bridge {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0 0.5rem;
          gap: 0.25rem;
        }
        .ai-bridge-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--peach-200);
          color: #934612;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.2rem;
        }
        .bridge-title {
          font-family: var(--font-display);
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--coral-500);
          letter-spacing: 0.05em;
        }
        .bridge-caption {
          font-size: 0.74rem;
          color: var(--charcoal-600);
          max-width: 130px;
          line-height: 1.3;
        }
        .vision-status-chip {
          margin-top: 0.35rem;
        }
        .status-evaluated {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--sage-600);
          background: #F0F8F2;
          padding: 2px 6px;
          border-radius: var(--radius-pill);
        }
        .status-evaluating {
          font-size: 0.72rem;
          color: var(--peach-500);
        }
        .status-available {
          font-size: 0.72rem;
          color: var(--charcoal-400);
        }

        /* Finder note */
        .match-finder-note {
          background: var(--cream-soft);
          border-left: 3px solid var(--peach-400);
          padding: 0.55rem 0.85rem;
          font-size: 0.82rem;
          color: var(--charcoal-800);
          border-radius: var(--radius-sm);
          margin-bottom: 0.95rem;
        }

        /* Action footer */
        .match-action-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-subtle);
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .ai-details-toggle {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: transparent;
          border: none;
          color: var(--charcoal-600);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
        }
        .ai-details-toggle:hover {
          color: var(--coral-500);
        }
        .matched-claimed-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--sage-600);
          background: var(--sage-100);
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-pill);
          font-weight: 700;
          font-size: 0.85rem;
        }

        /* Technical Details panel */
        .ai-technical-panel {
          margin-top: 0.85rem;
          background: var(--cream-soft);
          border: 1px dashed var(--border-warm);
          border-radius: var(--radius-md);
          padding: 0.75rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .tech-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.76rem;
        }
        .tech-label {
          color: var(--charcoal-600);
          font-weight: 600;
        }
        .tech-val {
          color: var(--charcoal-900);
          font-weight: 700;
        }

        .loading-match-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          padding: 1.5rem 0;
        }
        .match-spinner {
          width: 20px;
          height: 20px;
          border: 2.5px solid rgba(224, 109, 83, 0.2);
          border-top-color: var(--coral-500);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
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

        /* ──── Claim Section ──── */
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

        @media (max-width: 600px) {
          .match-visual-bridge-row {
            grid-template-columns: 1fr;
          }
          .match-connection-bridge {
            padding: 0.5rem 0;
          }
        }
      `}</style>
    </Modal>
  );
}
