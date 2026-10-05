import React, { useState } from 'react';
import { FileCheck, Calendar, MapPin, CheckCircle, XCircle, Shield, Edit3 } from 'lucide-react';
import Card from '../common/Card';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import { getCategoryIllustration } from '../../assets/illustrations/IllustratedIcons';

export default function ClaimCard({
  claim,
  isAdmin = false,
  onUpdateStatus,
  onViewItem,
}) {
  const found = claim.foundItem || {};
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(claim.VerificationNotes || '');

  const handleStatusChange = (status) => {
    if (onUpdateStatus) {
      onUpdateStatus(claim.ClaimID, status, notes);
      setIsEditingNotes(false);
    }
  };

  return (
    <Card variant="default" className="claim-card-wrap fade-in">
      <div className="claim-top-row">
        <div className="claim-id-badge">
          <FileCheck size={16} className="claim-icon" />
          <span>Claim #{claim.ClaimID}</span>
        </div>
        <StatusBadge status={claim.ClaimStatus} />
      </div>

      {/* Found Item Info */}
      <div
        className="claim-item-summary pressable"
        onClick={() => onViewItem && onViewItem(found, 'found')}
      >
        <div className="claim-item-thumb">
          {getCategoryIllustration(found.Category, 42)}
        </div>
        <div className="claim-item-text">
          <span className="claim-item-sub">Claimed Found Item</span>
          <h4 className="claim-item-title">{found.ItemName || 'Found Item'}</h4>
          <div className="claim-item-meta">
            <span><MapPin size={12} /> {found.FoundLocation || 'Campus'}</span>
            <span><Calendar size={12} /> {found.DateFound || 'Recent'}</span>
          </div>
        </div>
      </div>

      {/* Claimant Info */}
      <div className="claimant-info-box">
        <div className="claimant-avatar">
          {(claim.studentName || 'Student').charAt(0)}
        </div>
        <div className="claimant-details">
          <p className="claimant-name">{claim.studentName || `Student ID #${claim.StudentID}`}</p>
          <span className="claim-date-text">
            Filed on {new Date(claim.ClaimDate || Date.now()).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Verification Notes */}
      <div className="verification-notes-section">
        <div className="notes-header">
          <Shield size={14} className="notes-shield-icon" />
          <span>Security Admin Notes:</span>
          {isAdmin && !isEditingNotes && (
            <button
              type="button"
              onClick={() => setIsEditingNotes(true)}
              className="edit-notes-btn"
            >
              <Edit3 size={12} /> Edit Note
            </button>
          )}
        </div>

        {isEditingNotes ? (
          <div className="notes-edit-box">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add admin verification notes (e.g., ID verified, handed over)..."
              className="notes-textarea"
              rows={2}
            />
            <div className="notes-edit-actions">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingNotes(false)}
              >
                Cancel
              </Button>
              <Button
                variant="sage"
                size="sm"
                onClick={() => setIsEditingNotes(false)}
              >
                Save Note
              </Button>
            </div>
          </div>
        ) : (
          <p className="notes-content">
            {claim.VerificationNotes || 'No verification notes added yet. Awaiting in-person verification.'}
          </p>
        )}
      </div>

      {/* Admin Action Buttons */}
      {isAdmin && claim.ClaimStatus === 'Pending' && (
        <div className="admin-claim-actions">
          <Button
            variant="sage"
            size="sm"
            icon={CheckCircle}
            onClick={() => handleStatusChange('Approved')}
          >
            Approve Claim
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={XCircle}
            onClick={() => handleStatusChange('Rejected')}
          >
            Reject Claim
          </Button>
        </div>
      )}

      <style>{`
        .claim-card-wrap {
          background: #FFFFFF;
          margin-bottom: 1.25rem;
          padding: 1.25rem;
          border-radius: var(--radius-xl);
          text-align: left;
        }
        .claim-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .claim-id-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1rem;
          color: var(--charcoal-900);
        }
        .claim-icon {
          color: var(--coral-500);
        }
        .claim-item-summary {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          background: var(--cream-soft);
          border: 1px solid var(--border-warm);
          border-radius: var(--radius-md);
          padding: 0.75rem 1rem;
          margin-bottom: 0.85rem;
        }
        .claim-item-thumb {
          flex-shrink: 0;
        }
        .claim-item-text {
          flex: 1;
        }
        .claim-item-sub {
          font-size: 0.72rem;
          color: var(--charcoal-400);
          text-transform: uppercase;
          font-weight: 700;
        }
        .claim-item-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--charcoal-900);
          margin: 0.1rem 0 0.25rem 0;
        }
        .claim-item-meta {
          display: flex;
          gap: 0.85rem;
          font-size: 0.76rem;
          color: var(--charcoal-600);
        }
        .claim-item-meta span {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }
        .claimant-info-box {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.5rem 0;
          border-top: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 0.75rem;
        }
        .claimant-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--coral-400);
          color: #FFFFFF;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
        }
        .claimant-name {
          font-weight: 700;
          font-size: 0.88rem;
          color: var(--charcoal-900);
          margin: 0;
        }
        .claim-date-text {
          font-size: 0.74rem;
          color: var(--charcoal-400);
        }
        .verification-notes-section {
          background: #FFFDF9;
          border: 1px solid var(--peach-200);
          border-radius: var(--radius-md);
          padding: 0.75rem 0.95rem;
          margin-bottom: 0.85rem;
        }
        .notes-header {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: #934612;
          margin-bottom: 0.35rem;
        }
        .notes-shield-icon {
          color: var(--peach-500);
        }
        .edit-notes-btn {
          margin-left: auto;
          background: transparent;
          border: none;
          color: var(--coral-500);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }
        .notes-content {
          font-size: 0.84rem;
          color: var(--charcoal-800);
          line-height: 1.45;
          margin: 0;
        }
        .notes-textarea {
          width: 100%;
          border: 1.5px solid var(--border-warm);
          border-radius: var(--radius-sm);
          padding: 0.45rem;
          font-family: inherit;
          font-size: 0.85rem;
          outline: none;
          margin-bottom: 0.4rem;
        }
        .notes-textarea:focus {
          border-color: var(--coral-500);
        }
        .notes-edit-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.4rem;
        }
        .admin-claim-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.65rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-subtle);
        }
      `}</style>
    </Card>
  );
}
