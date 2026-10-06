import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Package,
  Layers,
  ArrowRight,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import DashboardStat from '../components/dashboard/DashboardStat';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';
import { getCategoryIllustration } from '../assets/illustrations/IllustratedIcons';
import { getItemImageUrl } from '../utils/imageUrl';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AdminDashboardPage({ onNavigate, onSelectItem }) {
  const { user } = useAuth();
  const toast = useToast();

  const [pendingReports, setPendingReports] = useState({ pendingLost: [], pendingFound: [] });
  const [claims, setClaims] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [pending, claimList, lost, found] = await Promise.all([
        api.getPendingReports(),
        api.getAllClaims(),
        api.getLostItems(),
        api.getFoundItems(),
      ]);

      setPendingReports(pending || { pendingLost: [], pendingFound: [] });
      setClaims(claimList || []);
      setLostItems(lost || []);
      setFoundItems(found || []);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLost = async (lostId) => {
    try {
      await api.verifyLostItem(lostId, user?.AdminID || 1);
      toast.success(`Lost item #${lostId} verified by admin!`);
      loadAdminData();
    } catch {
      toast.error('Failed to verify lost item');
    }
  };

  const handleVerifyFound = async (foundId) => {
    try {
      await api.verifyFoundItem(foundId, user?.AdminID || 1);
      toast.success(`Found item #${foundId} verified by admin!`);
      loadAdminData();
    } catch {
      toast.error('Failed to verify found item');
    }
  };

  const handleApproveClaim = async (claimId) => {
    try {
      await api.updateClaimStatus(claimId, user?.AdminID || 1, 'Approved', 'Verified student college ID at security post');
      toast.success(`Claim #${claimId} approved!`);
      loadAdminData();
    } catch {
      toast.error('Failed to approve claim');
    }
  };

  const handleRejectClaim = async (claimId) => {
    try {
      await api.updateClaimStatus(claimId, user?.AdminID || 1, 'Rejected', 'Insufficient proof of ownership');
      toast.info(`Claim #${claimId} rejected`);
      loadAdminData();
    } catch {
      toast.error('Failed to reject claim');
    }
  };

  const pendingLost = pendingReports.pendingLost || [];
  const pendingFound = pendingReports.pendingFound || [];
  const pendingClaims = claims.filter((c) => c.ClaimStatus === 'Pending');

  return (
    <div className="admin-dashboard-page fade-in">
      <div className="app-container">
        {/* Admin Header */}
        <div className="admin-welcome-banner">
          <div>
            <div className="admin-shield-badge">
              <ShieldCheck size={16} /> Campus Security Administration
            </div>
            <h1 className="admin-main-title">Verification &amp; Control Desk</h1>
            <p className="admin-subtext">
              Verify incoming student lost/found reports, review ownership claims, and authorize item handovers.
            </p>
          </div>

          <div className="admin-quick-actions">
            <Button
              variant="outline"
              size="md"
              icon={Layers}
              onClick={() => onNavigate('admin-management')}
            >
              All Items &amp; CRUD Console
            </Button>
          </div>
        </div>

        {/* Overview Statistics */}
        <div className="admin-stats-grid">
          <DashboardStat
            label="Pending Lost"
            value={pendingLost.length}
            subtext="need verify"
            color="coral"
            icon={Package}
          />
          <DashboardStat
            label="Pending Found"
            value={pendingFound.length}
            subtext="need verify"
            color="sage"
            icon={CheckCircle2}
          />
          <DashboardStat
            label="Pending Claims"
            value={pendingClaims.length}
            subtext="review proof"
            color="peach"
            icon={FileCheck2}
            onClick={() => onNavigate('claims')}
          />
          <DashboardStat
            label="Total Campus Items"
            value={lostItems.length + foundItems.length}
            subtext="registered"
            color="blue"
            icon={Layers}
            onClick={() => onNavigate('admin-management')}
          />
        </div>

        {/* Verification Priority Queues Grid */}
        <div className="admin-queues-grid">
          {/* Column 1: Pending Lost Reports */}
          <div className="queue-card">
            <div className="queue-header">
              <div className="queue-title-wrap">
                <span className="queue-dot coral" />
                <h3 className="queue-title">Pending Lost Verifications</h3>
              </div>
              <span className="queue-count-pill">{pendingLost.length}</span>
            </div>

            {loading ? (
              <LoadingState message="Fetching pending lost items..." />
            ) : pendingLost.length > 0 ? (
              <div className="queue-items-stack">
                {pendingLost.map((item) => (
                  <div key={item.LostID} className="queue-item-row fade-in">
                    <div className="queue-thumb">
                      {getItemImageUrl(item) ? (
                        <img src={getItemImageUrl(item)} alt={item.ItemName} className="queue-thumb-img" />
                      ) : (
                        getCategoryIllustration(item.Category, 42)
                      )}
                    </div>
                    <div className="queue-info">
                      <h4
                        className="queue-name pressable"
                        onClick={() => onSelectItem(item, 'lost')}
                      >
                        {item.ItemName}
                      </h4>
                      <p className="queue-meta">
                        {item.LostLocation} · {item.Category} · {item.Color}
                      </p>
                      <span className="queue-date">
                        Date: {item.DateLost || 'Recent'}
                      </span>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={ShieldCheck}
                      onClick={() => handleVerifyLost(item.LostID)}
                    >
                      Verify
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="queue-empty-box">
                <CheckCircle2 size={24} className="queue-empty-icon" />
                <p>All lost reports have been verified!</p>
              </div>
            )}
          </div>

          {/* Column 2: Pending Found Reports */}
          <div className="queue-card">
            <div className="queue-header">
              <div className="queue-title-wrap">
                <span className="queue-dot sage" />
                <h3 className="queue-title">Pending Found Verifications</h3>
              </div>
              <span className="queue-count-pill">{pendingFound.length}</span>
            </div>

            {loading ? (
              <LoadingState message="Fetching pending found items..." />
            ) : pendingFound.length > 0 ? (
              <div className="queue-items-stack">
                {pendingFound.map((item) => (
                  <div key={item.FoundID} className="queue-item-row fade-in">
                    <div className="queue-thumb">
                      {getItemImageUrl(item) ? (
                        <img src={getItemImageUrl(item)} alt={item.ItemName} className="queue-thumb-img" />
                      ) : (
                        getCategoryIllustration(item.Category, 42)
                      )}
                    </div>
                    <div className="queue-info">
                      <h4
                        className="queue-name pressable"
                        onClick={() => onSelectItem(item, 'found')}
                      >
                        {item.ItemName}
                      </h4>
                      <p className="queue-meta">
                        {item.FoundLocation} · {item.Category} · {item.Color}
                      </p>
                      <span className="queue-date">
                        Date: {item.DateFound || 'Recent'}
                      </span>
                    </div>
                    <Button
                      variant="sage"
                      size="sm"
                      icon={ShieldCheck}
                      onClick={() => handleVerifyFound(item.FoundID)}
                    >
                      Verify
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="queue-empty-box">
                <CheckCircle2 size={24} className="queue-empty-icon" />
                <p>All found turn-in items have been verified!</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Claims Review Section */}
        <div className="admin-claims-section">
          <div className="section-title-bar">
            <div>
              <h2 className="dash-section-title">Pending Ownership Claims</h2>
              <p className="dash-section-desc">
                Students requesting release of turned-in items. Match ID and hand over.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('claims')}
            >
              Open Full Claims Desk &rarr;
            </Button>
          </div>

          {pendingClaims.length > 0 ? (
            <div className="admin-claims-grid">
              {pendingClaims.map((claim) => (
                <div key={claim.ClaimID} className="admin-claim-box fade-in">
                  <div className="claim-box-header">
                    <div className="claim-claimant-info">
                      <span className="claimant-title">{claim.studentName || `Student #${claim.StudentID}`}</span>
                      <span className="claim-date">Claimed on {claim.ClaimDate?.split(' ')[0] || 'Recent'}</span>
                    </div>
                    <StatusBadge status={claim.ClaimStatus} />
                  </div>

                  <div className="claimed-item-preview">
                    {getCategoryIllustration(claim.foundItem?.Category, 36)}
                    <div>
                      <h5 className="claimed-name">{claim.foundItem?.ItemName || `Found Item #${claim.FoundID}`}</h5>
                      <span className="claimed-loc">{claim.foundItem?.FoundLocation}</span>
                    </div>
                  </div>

                  {claim.VerificationNotes && (
                    <p className="claim-notes-quote">"{claim.VerificationNotes}"</p>
                  )}

                  <div className="claim-action-buttons">
                    <Button
                      variant="sage"
                      size="sm"
                      icon={CheckCircle2}
                      onClick={() => handleApproveClaim(claim.ClaimID)}
                    >
                      Approve &amp; Release
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={XCircle}
                      onClick={() => handleRejectClaim(claim.ClaimID)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="queue-empty-box">
              <CheckCircle2 size={24} className="queue-empty-icon" />
              <p>No student ownership claims awaiting verification right now.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .admin-dashboard-page {
          padding: 2rem 0;
          text-align: left;
        }
        .admin-welcome-banner {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .admin-shield-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: var(--sage-100);
          color: var(--sage-600);
          border: 1px solid rgba(109, 151, 117, 0.3);
          padding: 0.3rem 0.85rem;
          border-radius: var(--radius-pill);
          font-size: 0.8rem;
          font-weight: 700;
          margin-bottom: 0.4rem;
        }
        .admin-main-title {
          font-size: clamp(2rem, 3.5vw, 2.5rem);
          font-weight: 800;
          color: var(--charcoal-900);
          margin-bottom: 0.35rem;
        }
        .admin-subtext {
          font-size: 1rem;
          color: var(--charcoal-600);
          max-width: 580px;
          margin: 0;
        }
        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          margin-bottom: 2.25rem;
        }
        .admin-queues-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.75rem;
          margin-bottom: 2.5rem;
        }
        .queue-card {
          background: #FFFFFF;
          border: 1.5px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
        }
        .queue-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        .queue-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .queue-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .queue-dot.coral { background: var(--coral-500); }
        .queue-dot.sage { background: var(--sage-500); }
        .queue-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--charcoal-900);
          margin: 0;
        }
        .queue-count-pill {
          background: var(--cream-soft);
          border: 1px solid var(--border-warm);
          padding: 2px 8px;
          border-radius: var(--radius-pill);
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--charcoal-600);
        }
        .queue-items-stack {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .queue-item-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          background: var(--cream-soft);
          border: 1px solid var(--border-warm);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
        }
        .queue-thumb {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .queue-thumb-img {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-md);
          object-fit: cover;
          border: 1px solid var(--border-warm);
        }
        .queue-info {
          flex: 1;
        }
        .queue-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--charcoal-900);
          margin-bottom: 0.2rem;
        }
        .queue-name:hover {
          color: var(--coral-500);
        }
        .queue-meta {
          font-size: 0.8rem;
          color: var(--charcoal-600);
          margin: 0 0 0.15rem 0;
        }
        .queue-date {
          font-size: 0.72rem;
          color: var(--charcoal-400);
        }
        .queue-empty-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1rem;
          color: var(--sage-600);
          font-size: 0.92rem;
          font-weight: 600;
          text-align: center;
          background: var(--cream-subtle);
          border-radius: var(--radius-lg);
        }
        .queue-empty-icon {
          margin-bottom: 0.5rem;
        }
        .admin-claims-section {
          background: #FFFFFF;
          border: 1.5px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          padding: 1.75rem;
          box-shadow: var(--shadow-sm);
        }
        .admin-claims-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.25rem;
        }
        .admin-claim-box {
          background: var(--cream-soft);
          border: 1px solid var(--border-warm);
          border-radius: var(--radius-lg);
          padding: 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .claim-box-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }
        .claimant-title {
          display: block;
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--charcoal-900);
        }
        .claim-date {
          font-size: 0.74rem;
          color: var(--charcoal-400);
        }
        .claimed-item-preview {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          background: #FFFFFF;
          border: 1px solid var(--border-warm);
          border-radius: var(--radius-md);
          padding: 0.5rem 0.75rem;
        }
        .claimed-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--charcoal-900);
          margin: 0;
        }
        .claimed-loc {
          font-size: 0.75rem;
          color: var(--charcoal-400);
        }
        .claim-notes-quote {
          font-size: 0.8rem;
          color: var(--charcoal-600);
          font-style: italic;
          margin: 0;
        }
        .claim-action-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          margin-top: auto;
        }
        @media (max-width: 900px) {
          .admin-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .admin-queues-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .admin-stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
