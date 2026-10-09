import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  PlusCircle,
  Package,
  CheckCircle2,
  Bell,
  Clock,
  ArrowRight,
  Shield,
  FileCheck2,
} from 'lucide-react';
import DashboardStat from '../components/dashboard/DashboardStat';
import QuickActionCard from '../components/dashboard/QuickActionCard';
import MatchCard from '../components/items/MatchCard';
import ItemCard from '../components/items/ItemCard';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import {
  BackpackIllustration,
  WaterBottleIllustration,
  MatchSparkleIllustration,
} from '../assets/illustrations/IllustratedIcons';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export default function DashboardPage({ onNavigate, onSelectItem }) {
  const { user } = useAuth();
  const toast = useToast();

  const [myLostItems, setMyLostItems] = useState([]);
  const [myFoundItems, setMyFoundItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [matches, setMatches] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentId = user?.StudentID || 2;
  const firstName = user?.Name ? user.Name.split(' ')[0] : 'Parthvi';

  useEffect(() => {
    loadDashboardData();
  }, [studentId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [lost, found, claims, matchList, notifs] = await Promise.all([
        api.getLostItemsByStudent(studentId),
        api.getFoundItemsByStudent(studentId),
        api.getClaimsByStudent(studentId),
        api.getMatches(),
        api.getNotifications(studentId),
      ]);

      setMyLostItems(lost || []);
      setMyFoundItems(found || []);
      setMyClaims(claims || []);
      setMatches(matchList || []);
      setNotifications(notifs || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmMatch = async (match) => {
    try {
      await api.updateMatchStatus(match.MatchID, 'Confirmed');
      toast.success('Match confirmed! Item is ready for security claim handover.');
      loadDashboardData();
    } catch (err) {
      toast.error('Failed to confirm match');
    }
  };

  const handleClaimMatch = async (match) => {
    try {
      await api.createClaim(match.FoundID);
      toast.success('Ownership claim filed with Campus Security!');
      onNavigate('claims');
    } catch (err) {
      toast.error(err.message || 'Failed to file claim');
    }
  };

  return (
    <div className="dashboard-page-wrap fade-in">
      <div className="app-container">
        {/* Welcome Greeting Banner */}
        <div className="dashboard-welcome-banner">
          <div className="welcome-text-col">
            <h1 className="welcome-greeting">
              Hey {firstName} <span className="greeting-wave">👋</span>
            </h1>
            <p className="welcome-tagline">
              Let’s get your stuff back. Check AI candidate matches, active reports, and claims below.
            </p>
          </div>
          <div className="welcome-status-pill">
            <span className="live-radar-dot" />
            <span>AI Radar Active · Campusfind AI</span>
          </div>
        </div>

        {/* Overview Statistics Grid */}
        <div className="stats-row-grid">
          <DashboardStat
            label="My Lost Items"
            value={myLostItems.length}
            subtext="reported"
            color="coral"
            icon={Package}
            onClick={() => onNavigate('lost-items')}
          />
          <DashboardStat
            label="My Found Items"
            value={myFoundItems.length}
            subtext="handed in"
            color="sage"
            icon={CheckCircle2}
            onClick={() => onNavigate('found-items')}
          />
          <DashboardStat
            label="Active Claims"
            value={myClaims.length}
            subtext="under review"
            color="peach"
            icon={FileCheck2}
            onClick={() => onNavigate('claims')}
          />
          <DashboardStat
            label="Unread Alerts"
            value={notifications.filter((n) => !n.ReadStatus).length}
            subtext="updates"
            color="blue"
            icon={Bell}
            onClick={() => onNavigate('notifications')}
          />
        </div>

        {/* Big Cute Quick Action Cards */}
        <div className="quick-actions-row">
          <QuickActionCard
            title="Report Lost Item"
            description="Lost a bottle, earphone case, or keys? Create a quick report so AI can track down matches."
            tag="Lost Something?"
            theme="coral"
            illustration={<BackpackIllustration size={80} />}
            onClick={() => onNavigate('report-lost')}
          />
          <QuickActionCard
            title="Report Found Item"
            description="Found an abandoned laptop charger or ID badge? Turn it in and be a campus hero today!"
            tag="Found An Item?"
            theme="sage"
            illustration={<WaterBottleIllustration size={80} />}
            onClick={() => onNavigate('report-found')}
          />
        </div>

        {/* Live AI Match Radar Section */}
        <div className="dashboard-section">
          <div className="section-title-bar">
            <div className="title-left">
              <div className="title-sparkle-bubble">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="dash-section-title">Possible Matches ✨</h2>
                <p className="dash-section-desc">
                  Live AI candidates detected between your lost items and turned-in campus goods.
                </p>
              </div>
            </div>
            {matches.length > 0 && (
              <span className="match-counter-pill">
                {matches.length} Candidates
              </span>
            )}
          </div>

          {matches.length > 0 ? (
            <div className="matches-list-container">
              {matches.map((match) => (
                <MatchCard
                  key={match.MatchID}
                  match={match}
                  onConfirm={handleConfirmMatch}
                  onClaim={handleClaimMatch}
                  onViewItem={(item, itemType) => onSelectItem(item, itemType)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No pending matches right now"
              description="Our AI continuously searches new found reports across campus. You'll get notified the second a match appears!"
              actionLabel="Report Another Item"
              onAction={() => onNavigate('report-lost')}
            />
          )}
        </div>

        {/* Two-Column Section: My Active Reports & Recent Notifications */}
        <div className="dashboard-dual-grid">
          {/* Left: My Reported Items */}
          <div className="dual-col-left">
            <div className="section-title-bar">
              <div>
                <h3 className="sub-section-title">My Recent Lost Reports</h3>
                <p className="sub-section-desc">Items you're currently tracking</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('lost-items')}
              >
                View All &rarr;
              </Button>
            </div>

            {myLostItems.length > 0 ? (
              <div className="items-grid">
                {myLostItems.slice(0, 2).map((item) => (
                  <ItemCard
                    key={item.LostID}
                    item={item}
                    type="lost"
                    hasMatch={item.Status === 'Matched'}
                    onClick={() => onSelectItem(item, 'lost')}
                  />
                ))}
              </div>
            ) : (
              <Card variant="flat" padding="lg" className="text-center">
                <p>You haven't reported any lost items yet.</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigate('report-lost')}
                  style={{ marginTop: '0.5rem' }}
                >
                  Create First Report
                </Button>
              </Card>
            )}
          </div>

          {/* Right: Recent Notifications */}
          <div className="dual-col-right">
            <div className="section-title-bar">
              <div>
                <h3 className="sub-section-title">Recent Notifications</h3>
                <p className="sub-section-desc">Updates from finders and security</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('notifications')}
              >
                Open Center &rarr;
              </Button>
            </div>

            <div className="recent-notifs-stack">
              {notifications.slice(0, 3).map((notif) => (
                <div
                  key={notif.NotificationID}
                  className={`mini-notif-row pressable ${!notif.ReadStatus ? 'unread' : ''}`}
                  onClick={() => onNavigate('notifications')}
                >
                  <div className="mini-notif-dot" />
                  <div className="mini-notif-text">
                    <p className="mini-msg">{notif.Message}</p>
                    <span className="mini-time">
                      <Clock size={11} /> {new Date(notif.Date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <ArrowRight size={14} className="mini-arrow" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-page-wrap {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding: 2rem 0;
        }
        .dashboard-welcome-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
          text-align: left;
        }
        .welcome-greeting {
          font-size: clamp(2rem, 3.5vw, 2.6rem);
          font-weight: 800;
          color: var(--charcoal-900);
          margin-bottom: 0.35rem;
        }
        .greeting-wave {
          display: inline-block;
          animation: wave 2.2s infinite;
          transform-origin: 70% 70%;
        }
        @keyframes wave {
          0%, 60%, 100% { transform: rotate(0deg); }
          10%, 30% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
        }
        .welcome-tagline {
          font-size: 1.05rem;
          color: var(--charcoal-600);
          max-width: 580px;
          margin: 0;
        }
        .welcome-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #FFFFFF;
          border: 1.5px solid var(--sage-200);
          border-radius: var(--radius-pill);
          padding: 0.45rem 1rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--sage-600);
          box-shadow: var(--shadow-sm);
        }
        .live-radar-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--sage-500);
          animation: radarPulse 1.8s infinite;
        }
        @keyframes radarPulse {
          0% { box-shadow: 0 0 0 0 rgba(109, 151, 117, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(109, 151, 117, 0); }
          100% { box-shadow: 0 0 0 0 rgba(109, 151, 117, 0); }
        }
        .stats-row-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          margin-bottom: 2rem;
        }
        .quick-actions-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        .dashboard-section {
          background: #FFFFFF;
          border: 1.5px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          padding: 1.75rem;
          margin-bottom: 2.5rem;
          box-shadow: var(--shadow-sm);
          text-align: left;
        }
        .section-title-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .title-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .title-sparkle-bubble {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: var(--peach-200);
          color: #934612;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dash-section-title {
          font-size: 1.35rem;
          color: var(--charcoal-900);
          margin-bottom: 0.15rem;
        }
        .dash-section-desc {
          font-size: 0.88rem;
          color: var(--charcoal-400);
          margin: 0;
        }
        .match-counter-pill {
          background: var(--peach-200);
          color: #934612;
          font-weight: 700;
          font-size: 0.82rem;
          padding: 0.3rem 0.85rem;
          border-radius: var(--radius-pill);
        }
        .matches-list-container {
          display: flex;
          flex-direction: column;
        }
        .dashboard-dual-grid {
          display: grid;
          grid-template-columns: 1.25fr 0.85fr;
          gap: 2rem;
          text-align: left;
        }
        .sub-section-title {
          font-size: 1.15rem;
          color: var(--charcoal-900);
          margin-bottom: 0.15rem;
        }
        .sub-section-desc {
          font-size: 0.82rem;
          color: var(--charcoal-400);
          margin: 0;
        }
        .recent-notifs-stack {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .mini-notif-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
          transition: all var(--transition-fast);
        }
        .mini-notif-row.unread {
          border-left: 4px solid var(--coral-500);
          background: #FFFDF9;
        }
        .mini-notif-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--peach-400);
          flex-shrink: 0;
        }
        .mini-notif-text {
          flex: 1;
        }
        .mini-msg {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--charcoal-900);
          margin: 0 0 0.2rem 0;
          line-height: 1.35;
        }
        .mini-time {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.74rem;
          color: var(--charcoal-400);
        }
        .mini-arrow {
          color: var(--charcoal-400);
          flex-shrink: 0;
        }
        @media (max-width: 900px) {
          .stats-row-grid { grid-template-columns: repeat(2, 1fr); }
          .quick-actions-row { grid-template-columns: 1fr; }
          .dashboard-dual-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .stats-row-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
