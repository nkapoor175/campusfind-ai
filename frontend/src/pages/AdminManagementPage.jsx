import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  FileCheck2,
  Sparkles,
  Eye,
  RefreshCw,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import { getCategoryIllustration } from '../assets/illustrations/IllustratedIcons';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AdminManagementPage({ onSelectItem }) {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('lost'); // 'lost' | 'found' | 'claims' | 'matches'
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [lost, found, claimList, matchList] = await Promise.all([
        api.getLostItems(),
        api.getFoundItems(),
        api.getAllClaims(),
        api.getMatches(),
      ]);

      setLostItems(lost || []);
      setFoundItems(found || []);
      setClaims(claimList || []);
      setMatches(matchList || []);
    } catch (err) {
      console.error('Error fetching admin management data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLost = async (lostId) => {
    try {
      await api.verifyLostItem(lostId);
      toast.success(`Lost Item #${lostId} successfully verified!`);
      loadAllData();
    } catch {
      toast.error('Failed to verify item');
    }
  };

  const handleVerifyFound = async (foundId) => {
    try {
      await api.verifyFoundItem(foundId);
      toast.success(`Found Item #${foundId} successfully verified!`);
      loadAllData();
    } catch {
      toast.error('Failed to verify item');
    }
  };

  const handleUpdateClaim = async (claimId, newStatus) => {
    try {
      await api.updateClaimStatus(
        claimId,
        newStatus,
        newStatus === 'Approved'
          ? 'Physical College ID & details verified at security desk.'
          : 'Verification rejected by administrator.'
      );
      toast.success(`Claim #${claimId} marked as ${newStatus}`);
      loadAllData();
    } catch {
      toast.error('Failed to update claim');
    }
  };

  const handleUpdateMatchStatus = async (matchId, newStatus) => {
    try {
      await api.updateMatchStatus(matchId, newStatus);
      toast.success(`Match #${matchId} status updated to ${newStatus}`);
      loadAllData();
    } catch {
      toast.error('Failed to update match status');
    }
  };

  // Filter items by search & status
  const filterList = (list, nameKey) => {
    return list.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (item[nameKey] || '').toLowerCase();
        const cat = (item.Category || '').toLowerCase();
        const desc = (item.Description || '').toLowerCase();
        const brand = (item.Brand || '').toLowerCase();
        if (!name.includes(q) && !cat.includes(q) && !desc.includes(q) && !brand.includes(q)) {
          return false;
        }
      }
      if (statusFilter !== 'All') {
        const st = (item.Status || item.ClaimStatus || item.MatchStatus || '').toLowerCase();
        if (st !== statusFilter.toLowerCase()) {
          return false;
        }
      }
      return true;
    });
  };

  const filteredLost = filterList(lostItems, 'ItemName');
  const filteredFound = filterList(foundItems, 'ItemName');
  const filteredClaims = claims.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const sName = (c.studentName || '').toLowerCase();
      const fName = (c.foundItem?.ItemName || '').toLowerCase();
      if (!sName.includes(q) && !fName.includes(q)) return false;
    }
    if (statusFilter !== 'All') {
      if ((c.ClaimStatus || '').toLowerCase() !== statusFilter.toLowerCase()) return false;
    }
    return true;
  });
  const filteredMatches = matches.filter((m) => {
    if (statusFilter !== 'All') {
      if ((m.MatchStatus || '').toLowerCase() !== statusFilter.toLowerCase()) return false;
    }
    return true;
  });

  return (
    <div className="admin-management-page fade-in">
      <div className="app-container">
        {/* Header */}
        <div className="management-header">
          <div>
            <span className="mgmt-badge">Database &amp; Operations Management</span>
            <h1 className="mgmt-title">Campus Records &amp; CRUD Console</h1>
            <p className="mgmt-desc">
              Manage database records directly. Search, filter, verify reports, process student claims, and audit AI matches.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={loadAllData}
          >
            Refresh Data
          </Button>
        </div>

        {/* Management Tabs */}
        <div className="mgmt-tabs-row">
          <button
            type="button"
            className={`mgmt-tab-btn ${activeTab === 'lost' ? 'active' : ''}`}
            onClick={() => { setActiveTab('lost'); setStatusFilter('All'); }}
          >
            <span className="tab-pill-icon coral">🎒</span>
            <span>Lost Items ({lostItems.length})</span>
          </button>
          <button
            type="button"
            className={`mgmt-tab-btn ${activeTab === 'found' ? 'active' : ''}`}
            onClick={() => { setActiveTab('found'); setStatusFilter('All'); }}
          >
            <span className="tab-pill-icon sage">💧</span>
            <span>Found Items ({foundItems.length})</span>
          </button>
          <button
            type="button"
            className={`mgmt-tab-btn ${activeTab === 'claims' ? 'active' : ''}`}
            onClick={() => { setActiveTab('claims'); setStatusFilter('All'); }}
          >
            <span className="tab-pill-icon peach">📋</span>
            <span>Claims ({claims.length})</span>
          </button>
          <button
            type="button"
            className={`mgmt-tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
            onClick={() => { setActiveTab('matches'); setStatusFilter('All'); }}
          >
            <span className="tab-pill-icon yellow">✨</span>
            <span>Match Records ({matches.length})</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="mgmt-controls-bar">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={`Search ${activeTab} records by title, brand, or notes...`}
            onClear={() => setSearchQuery('')}
          />
          <div className="mgmt-status-chips">
            <span className="filter-label">Filter:</span>
            {['All', 'Open', 'Pending', 'Matched', 'Claimed', 'Approved', 'Rejected'].map((st) => (
              <button
                key={st}
                type="button"
                className={`mgmt-chip ${statusFilter === st ? 'active' : ''}`}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area Based on Active Tab */}
        {loading ? (
          <LoadingState message="Fetching management records..." />
        ) : (
          <div className="mgmt-table-card">
            {/* TAB 1: LOST ITEMS */}
            {activeTab === 'lost' && (
              filteredLost.length > 0 ? (
                <div className="table-responsive-wrapper">
                  <table className="mgmt-data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Item &amp; Category</th>
                        <th>Color / Brand</th>
                        <th>Location</th>
                        <th>Date Lost</th>
                        <th>Status</th>
                        <th>Verification</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLost.map((item) => (
                        <tr key={item.LostID} className="table-row">
                          <td className="row-id">#{item.LostID}</td>
                          <td>
                            <div className="table-item-cell">
                              {getCategoryIllustration(item.Category, 32)}
                              <div>
                                <span className="table-item-name">{item.ItemName}</span>
                                <span className="table-item-cat">{item.Category}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="table-detail-text">
                              {item.Color || '—'} {item.Brand ? `· ${item.Brand}` : ''}
                            </span>
                          </td>
                          <td className="table-loc-text">{item.LostLocation || 'Campus'}</td>
                          <td className="table-date-text">{item.DateLost || 'Recent'}</td>
                          <td>
                            <StatusBadge status={item.Status} />
                          </td>
                          <td>
                            {item.AdminID ? (
                              <span className="badge badge-sage">
                                <ShieldCheck size={12} /> Verified
                              </span>
                            ) : (
                              <span className="badge badge-yellow">
                                <Clock size={12} /> Pending
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="table-action-btns">
                              {!item.AdminID && (
                                <Button
                                  variant="sage"
                                  size="sm"
                                  onClick={() => handleVerifyLost(item.LostID)}
                                >
                                  Verify
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                icon={Eye}
                                onClick={() => onSelectItem(item, 'lost')}
                              >
                                View
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No lost items match your criteria" />
              )
            )}

            {/* TAB 2: FOUND ITEMS */}
            {activeTab === 'found' && (
              filteredFound.length > 0 ? (
                <div className="table-responsive-wrapper">
                  <table className="mgmt-data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Item &amp; Category</th>
                        <th>Color / Brand</th>
                        <th>Found Location</th>
                        <th>Date Found</th>
                        <th>Status</th>
                        <th>Verification</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFound.map((item) => (
                        <tr key={item.FoundID} className="table-row">
                          <td className="row-id">#{item.FoundID}</td>
                          <td>
                            <div className="table-item-cell">
                              {getCategoryIllustration(item.Category, 32)}
                              <div>
                                <span className="table-item-name">{item.ItemName}</span>
                                <span className="table-item-cat">{item.Category}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="table-detail-text">
                              {item.Color || '—'} {item.Brand ? `· ${item.Brand}` : ''}
                            </span>
                          </td>
                          <td className="table-loc-text">{item.FoundLocation || 'Campus'}</td>
                          <td className="table-date-text">{item.DateFound || 'Recent'}</td>
                          <td>
                            <StatusBadge status={item.Status} />
                          </td>
                          <td>
                            {item.AdminID ? (
                              <span className="badge badge-sage">
                                <ShieldCheck size={12} /> Verified
                              </span>
                            ) : (
                              <span className="badge badge-yellow">
                                <Clock size={12} /> Pending
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="table-action-btns">
                              {!item.AdminID && (
                                <Button
                                  variant="sage"
                                  size="sm"
                                  onClick={() => handleVerifyFound(item.FoundID)}
                                >
                                  Verify
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                icon={Eye}
                                onClick={() => onSelectItem(item, 'found')}
                              >
                                View
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No found items match your criteria" />
              )
            )}

            {/* TAB 3: CLAIMS */}
            {activeTab === 'claims' && (
              filteredClaims.length > 0 ? (
                <div className="table-responsive-wrapper">
                  <table className="mgmt-data-table">
                    <thead>
                      <tr>
                        <th>Claim ID</th>
                        <th>Claimant</th>
                        <th>Found Item</th>
                        <th>Date Filed</th>
                        <th>Status</th>
                        <th>Admin Notes</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClaims.map((claim) => (
                        <tr key={claim.ClaimID} className="table-row">
                          <td className="row-id">#{claim.ClaimID}</td>
                          <td>
                            <strong>{claim.studentName || `Student #${claim.StudentID}`}</strong>
                          </td>
                          <td>
                            <span className="table-item-name">{claim.foundItem?.ItemName || `Found #${claim.FoundID}`}</span>
                          </td>
                          <td className="table-date-text">{claim.ClaimDate?.split(' ')[0] || 'Recent'}</td>
                          <td>
                            <StatusBadge status={claim.ClaimStatus} />
                          </td>
                          <td className="table-notes-text">
                            {claim.VerificationNotes || 'Awaiting in-person ID verification'}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="table-action-btns">
                              {claim.ClaimStatus === 'Pending' ? (
                                <>
                                  <Button
                                    variant="sage"
                                    size="sm"
                                    onClick={() => handleUpdateClaim(claim.ClaimID, 'Approved')}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateClaim(claim.ClaimID, 'Rejected')}
                                  >
                                    Reject
                                  </Button>
                                </>
                              ) : (
                                <span className="status-resolved-tag">Resolved</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No claims match your criteria" />
              )
            )}

            {/* TAB 4: MATCH RECORDS */}
            {activeTab === 'matches' && (
              filteredMatches.length > 0 ? (
                <div className="table-responsive-wrapper">
                  <table className="mgmt-data-table">
                    <thead>
                      <tr>
                        <th>Match ID</th>
                        <th>Lost Item</th>
                        <th>Found Candidate</th>
                        <th>Score</th>
                        <th>Match Status</th>
                        <th>Date</th>
                        <th style={{ textAlign: 'right' }}>Update Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMatches.map((m) => (
                        <tr key={m.MatchID} className="table-row">
                          <td className="row-id">#{m.MatchID}</td>
                          <td>
                            <span className="table-item-name">{m.lostItem?.ItemName || `Lost #${m.LostID}`}</span>
                          </td>
                          <td>
                            <span className="table-item-name">{m.foundItem?.ItemName || `Found #${m.FoundID}`}</span>
                          </td>
                          <td>
                            <span className="badge badge-peach">
                              {Math.round((m.score || 0.88) * 100)}%
                            </span>
                          </td>
                          <td>
                            <StatusBadge status={m.MatchStatus} />
                          </td>
                          <td className="table-date-text">{m.MatchDate?.split(' ')[0] || 'Recent'}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="table-action-btns">
                              {m.MatchStatus !== 'Confirmed' && (
                                <Button
                                  variant="sage"
                                  size="sm"
                                  onClick={() => handleUpdateMatchStatus(m.MatchID, 'Confirmed')}
                                >
                                  Confirm
                                </Button>
                              )}
                              {m.MatchStatus !== 'Rejected' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateMatchStatus(m.MatchID, 'Rejected')}
                                >
                                  Reject
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No match records found" />
              )
            )}
          </div>
        )}
      </div>

      <style>{`
        .admin-management-page {
          padding: 2rem 0;
          text-align: left;
        }
        .management-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .mgmt-badge {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 800;
          color: var(--sage-600);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.35rem;
        }
        .mgmt-title {
          font-size: clamp(2rem, 3.5vw, 2.5rem);
          font-weight: 800;
          color: var(--charcoal-900);
          margin-bottom: 0.35rem;
        }
        .mgmt-desc {
          font-size: 1rem;
          color: var(--charcoal-600);
          max-width: 620px;
          margin: 0;
        }
        .mgmt-tabs-row {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }
        .mgmt-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #FFFFFF;
          border: 1.5px solid var(--border-warm);
          border-radius: var(--radius-pill);
          padding: 0.65rem 1.25rem;
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--charcoal-600);
          cursor: pointer;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }
        .mgmt-tab-btn:hover {
          border-color: var(--peach-400);
          color: var(--charcoal-900);
        }
        .mgmt-tab-btn.active {
          background: var(--charcoal-900);
          color: #FFFFFF;
          border-color: var(--charcoal-900);
          box-shadow: var(--shadow-sm);
        }
        .tab-pill-icon {
          font-size: 1.1rem;
        }
        .mgmt-controls-bar {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .mgmt-status-chips {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-wrap: wrap;
        }
        .filter-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--charcoal-400);
          margin-right: 0.25rem;
        }
        .mgmt-chip {
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-pill);
          background: var(--cream-soft);
          border: 1px solid transparent;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--charcoal-600);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .mgmt-chip:hover {
          background: var(--peach-200);
          color: #934612;
        }
        .mgmt-chip.active {
          background: var(--coral-500);
          color: #FFFFFF;
        }
        .mgmt-table-card {
          background: #FFFFFF;
          border: 1.5px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }
        .table-responsive-wrapper {
          overflow-x: auto;
        }
        .mgmt-data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }
        .mgmt-data-table th {
          background: var(--cream-soft);
          padding: 1rem 1.15rem;
          font-weight: 700;
          color: var(--charcoal-800);
          text-align: left;
          border-bottom: 1.5px solid var(--border-warm);
          font-size: 0.82rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .mgmt-data-table td {
          padding: 1rem 1.15rem;
          border-bottom: 1px solid var(--border-subtle);
          color: var(--charcoal-800);
          vertical-align: middle;
        }
        .table-row:hover {
          background-color: #FFFDF9;
        }
        .row-id {
          font-family: var(--font-display);
          font-weight: 700;
          color: var(--charcoal-400);
        }
        .table-item-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .table-item-name {
          font-weight: 700;
          color: var(--charcoal-900);
          display: block;
        }
        .table-item-cat {
          font-size: 0.75rem;
          color: var(--coral-500);
          font-weight: 600;
        }
        .table-detail-text {
          font-size: 0.84rem;
          color: var(--charcoal-600);
        }
        .table-loc-text {
          font-size: 0.85rem;
          color: var(--charcoal-800);
        }
        .table-date-text {
          font-size: 0.82rem;
          color: var(--charcoal-400);
        }
        .table-notes-text {
          font-size: 0.82rem;
          color: var(--charcoal-600);
          max-width: 220px;
        }
        .table-action-btns {
          display: flex;
          justify-content: flex-end;
          gap: 0.4rem;
        }
        .status-resolved-tag {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--charcoal-400);
        }
      `}</style>
    </div>
  );
}
