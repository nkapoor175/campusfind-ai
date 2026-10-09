import React, { useState, useEffect } from 'react';
import { FileCheck, Filter, Shield } from 'lucide-react';
import ClaimCard from '../components/items/ClaimCard';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';
import Button from '../components/common/Button';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ClaimsPage({ onNavigate, onSelectItem }) {
  const { user, role } = useAuth();
  const toast = useToast();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  const isAdmin = role === 'admin';
  const studentId = user?.StudentID || 2;

  useEffect(() => {
    loadClaims();
  }, [studentId, role]);

  const loadClaims = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const all = await api.getAllClaims();
        setClaims(all || []);
      } else {
        const studentClaims = await api.getClaimsByStudent(studentId);
        setClaims(studentClaims || []);
      }
    } catch (err) {
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClaimStatus = async (claimId, newStatus, notes) => {
    try {
      await api.updateClaimStatus(claimId, newStatus, notes);
      toast.success(`Claim #${claimId} marked as ${newStatus}`);
      loadClaims();
    } catch {
      toast.error('Failed to update claim status');
    }
  };

  const filteredClaims = claims.filter((c) => {
    if (statusFilter !== 'All') {
      return (c.ClaimStatus || '').toLowerCase() === statusFilter.toLowerCase();
    }
    return true;
  });

  return (
    <div className="claims-page fade-in">
      <div className="app-container claims-container-inner">
        {/* Header */}
        <div className="claims-header-row">
          <div>
            <span className="claims-eyebrow">
              {isAdmin ? 'Campus Security Administrative Review' : 'Student Ownership Verification'}
            </span>
            <h1 className="claims-title">
              {isAdmin ? 'All Submitted Item Claims' : 'My Filed Ownership Claims'}
            </h1>
            <p className="claims-sub">
              {isAdmin
                ? 'Review ownership claims filed by students, verify physical student ID proofs, and approve release of found campus items.'
                : 'Track the verification progress of items you claimed. Approved items can be collected at the Campus Security Desk.'}
            </p>
          </div>

          {!isAdmin && (
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate('found-items')}
            >
              Browse Found Items &rarr;
            </Button>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="claims-filter-row">
          {['All', 'Pending', 'Approved', 'Rejected'].map((st) => (
            <button
              key={st}
              type="button"
              className={`claim-filter-pill ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st} {st !== 'All' && `(${claims.filter((c) => (c.ClaimStatus || '').toLowerCase() === st.toLowerCase()).length})`}
            </button>
          ))}
        </div>

        {/* Claims Cards */}
        {loading ? (
          <LoadingState message="Fetching ownership claims..." />
        ) : filteredClaims.length > 0 ? (
          <div className="claims-list-grid">
            {filteredClaims.map((claim) => (
              <ClaimCard
                key={claim.ClaimID}
                claim={claim}
                isAdmin={isAdmin}
                onUpdateStatus={handleUpdateClaimStatus}
                onViewItem={(item) => onSelectItem(item, 'found')}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No claims found"
            description={
              isAdmin
                ? 'No pending claims requiring administrative review.'
                : "You haven't filed any ownership claims yet. Browse turned-in found items to claim something that belongs to you!"
            }
            actionLabel={!isAdmin ? 'Browse Found Items' : undefined}
            onAction={!isAdmin ? () => onNavigate('found-items') : undefined}
          />
        )}
      </div>

      <style>{`
        .claims-page {
          padding: 2rem 0;
          text-align: left;
        }
        .claims-container-inner {
          max-width: 820px;
        }
        .claims-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 1.75rem;
        }
        .claims-eyebrow {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 800;
          color: var(--coral-500);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.25rem;
        }
        .claims-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--charcoal-900);
          margin-bottom: 0.35rem;
        }
        .claims-sub {
          font-size: 0.95rem;
          color: var(--charcoal-600);
          max-width: 580px;
          margin: 0;
          line-height: 1.5;
        }
        .claims-filter-row {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .claim-filter-pill {
          padding: 0.45rem 1rem;
          border-radius: var(--radius-pill);
          background: #FFFFFF;
          border: 1.5px solid var(--border-warm);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--charcoal-600);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .claim-filter-pill:hover {
          border-color: var(--peach-400);
          color: var(--charcoal-900);
        }
        .claim-filter-pill.active {
          background: var(--charcoal-900);
          color: #FFFFFF;
          border-color: var(--charcoal-900);
        }
        .claims-list-grid {
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}
