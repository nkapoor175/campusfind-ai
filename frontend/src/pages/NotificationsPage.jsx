import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Sparkles, Filter } from 'lucide-react';
import NotificationCard from '../components/notifications/NotificationCard';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function NotificationsPage({ onNavigate }) {
  const { user, setUnreadCount } = useAuth();
  const toast = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'unread' | 'matches'

  const studentId = user?.StudentID || 2;

  useEffect(() => {
    loadNotifications();
  }, [studentId]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications(studentId);
      setNotifications(data || []);
      const unread = (data || []).filter((n) => !n.ReadStatus).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.NotificationID === id ? { ...n, ReadStatus: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success('Marked as read');
    } catch {
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const unreadList = notifications.filter((n) => !n.ReadStatus);
      await Promise.all(unreadList.map((n) => api.markNotificationRead(n.NotificationID)));
      setNotifications((prev) => prev.map((n) => ({ ...n, ReadStatus: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === 'unread') return !n.ReadStatus;
    if (filterType === 'matches') {
      const msg = (n.Message || '').toLowerCase();
      return msg.includes('match') || msg.includes('✨');
    }
    return true;
  });

  return (
    <div className="notifications-page fade-in">
      <div className="app-container notifs-container-inner">
        {/* Header */}
        <div className="notifs-header-row">
          <div>
            <span className="notif-eyebrow">Campus Alerts &amp; Updates</span>
            <h1 className="notifs-title">Notification Center</h1>
            <p className="notifs-sub">
              Stay tuned to AI match alerts, claim approvals, and campus security verification status.
            </p>
          </div>

          {notifications.some((n) => !n.ReadStatus) && (
            <Button
              variant="outline"
              size="sm"
              icon={CheckCheck}
              onClick={handleMarkAllRead}
            >
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="notifs-filter-pills">
          <button
            type="button"
            className={`notif-pill ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All Updates ({notifications.length})
          </button>
          <button
            type="button"
            className={`notif-pill ${filterType === 'unread' ? 'active' : ''}`}
            onClick={() => setFilterType('unread')}
          >
            Unread ({notifications.filter((n) => !n.ReadStatus).length})
          </button>
          <button
            type="button"
            className={`notif-pill ${filterType === 'matches' ? 'active' : ''}`}
            onClick={() => setFilterType('matches')}
          >
            AI Matches ✨
          </button>
        </div>

        {/* Notification Stack */}
        {loading ? (
          <LoadingState message="Checking campus notifications..." />
        ) : filteredNotifs.length > 0 ? (
          <div className="notifs-list">
            {filteredNotifs.map((notif) => (
              <NotificationCard
                key={notif.NotificationID}
                notification={notif}
                onMarkRead={handleMarkRead}
                onClick={(n) => {
                  if (n.Message.includes('match') || n.Message.includes('✨')) {
                    onNavigate('dashboard');
                  } else if (n.Message.includes('claim') || n.Message.includes('Claim')) {
                    onNavigate('claims');
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="All caught up!"
            description={
              filterType === 'unread'
                ? "You have no unread notifications right now."
                : "No notifications in this view yet."
            }
            iconType="mascot"
          />
        )}
      </div>

      <style>{`
        .notifications-page {
          padding: 2rem 0;
          text-align: left;
        }
        .notifs-container-inner {
          max-width: 760px;
        }
        .notifs-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .notif-eyebrow {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 800;
          color: var(--coral-500);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.25rem;
        }
        .notifs-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--charcoal-900);
          margin-bottom: 0.35rem;
        }
        .notifs-sub {
          font-size: 0.95rem;
          color: var(--charcoal-600);
          max-width: 520px;
          margin: 0;
        }
        .notifs-filter-pills {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .notif-pill {
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
        .notif-pill:hover {
          border-color: var(--peach-400);
          color: var(--charcoal-900);
        }
        .notif-pill.active {
          background: var(--charcoal-900);
          color: #FFFFFF;
          border-color: var(--charcoal-900);
        }
        .notifs-list {
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}
