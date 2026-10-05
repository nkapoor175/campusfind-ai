import React from 'react';
import { Sparkles, CheckCircle2, ShieldAlert, Info, Clock, Check } from 'lucide-react';
import Card from '../common/Card';

export default function NotificationCard({
  notification,
  onMarkRead,
  onClick,
}) {
  const isUnread = !notification.ReadStatus;
  const msg = notification.Message || '';

  // Determine icon & category
  let Icon = Info;
  let typeClass = 'type-info';

  if (msg.includes('✨') || msg.toLowerCase().includes('match')) {
    Icon = Sparkles;
    typeClass = 'type-match';
  } else if (msg.includes('Approved') || msg.toLowerCase().includes('success') || msg.includes('🎉')) {
    Icon = CheckCircle2;
    typeClass = 'type-success';
  } else if (msg.includes('Shield') || msg.toLowerCase().includes('verified') || msg.includes('🛡️')) {
    Icon = ShieldAlert;
    typeClass = 'type-admin';
  }

  return (
    <Card
      variant="default"
      className={`notification-card ${isUnread ? 'is-unread' : 'is-read'} ${typeClass} fade-in`}
    >
      <div className="notif-inner" onClick={() => onClick && onClick(notification)}>
        <div className="notif-icon-circle">
          <Icon size={18} />
        </div>

        <div className="notif-body">
          <p className="notif-message-text">{msg}</p>
          <div className="notif-meta-row">
            <span className="notif-time">
              <Clock size={12} />
              {notification.Date ? new Date(notification.Date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }) : 'Just now'}
            </span>
            {isUnread && <span className="unread-dot-badge">New</span>}
          </div>
        </div>
      </div>

      {isUnread && onMarkRead && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead(notification.NotificationID);
          }}
          className="mark-read-btn pressable"
          title="Mark as read"
        >
          <Check size={14} />
          <span>Mark Read</span>
        </button>
      )}

      <style>{`
        .notification-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.15rem 1.35rem;
          margin-bottom: 0.85rem;
          border-radius: var(--radius-lg);
          transition: all var(--transition-fast);
          text-align: left;
        }
        .notification-card.is-unread {
          background-color: #FFFFFF;
          border-left: 5px solid var(--coral-500);
          box-shadow: var(--shadow-sm);
        }
        .notification-card.is-read {
          background-color: var(--cream-soft);
          border-color: var(--border-warm);
          opacity: 0.85;
        }
        .notif-inner {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
          cursor: pointer;
        }
        .notif-icon-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .type-match .notif-icon-circle {
          background: var(--peach-200);
          color: #934612;
        }
        .type-success .notif-icon-circle {
          background: var(--sage-100);
          color: var(--sage-600);
        }
        .type-admin .notif-icon-circle {
          background: var(--dusty-blue-100);
          color: var(--dusty-blue-600);
        }
        .type-info .notif-icon-circle {
          background: var(--coral-100);
          color: var(--coral-600);
        }
        .notif-body {
          flex: 1;
        }
        .notif-message-text {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--charcoal-900);
          margin-bottom: 0.25rem;
          line-height: 1.4;
        }
        .notif-meta-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .notif-time {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.76rem;
          color: var(--charcoal-400);
        }
        .unread-dot-badge {
          font-size: 0.7rem;
          font-weight: 700;
          color: #FFFFFF;
          background: var(--coral-500);
          padding: 1px 6px;
          border-radius: var(--radius-pill);
        }
        .mark-read-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: #FFFFFF;
          border: 1px solid var(--border-warm);
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-pill);
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--charcoal-600);
          cursor: pointer;
          transition: all 0.15s;
        }
        .mark-read-btn:hover {
          background: var(--sage-100);
          border-color: var(--sage-500);
          color: var(--sage-600);
        }
      `}</style>
    </Card>
  );
}
