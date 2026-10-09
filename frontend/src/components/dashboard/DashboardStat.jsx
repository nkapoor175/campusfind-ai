import React from 'react';
import Card from '../common/Card';

export default function DashboardStat({
  label,
  value,
  icon: Icon,
  color = 'coral', // 'coral' | 'peach' | 'sage' | 'blue'
  subtext,
  onClick,
}) {
  return (
    <Card
      variant={onClick ? 'interactive' : 'default'}
      onClick={onClick}
      className={`dashboard-stat-card stat-${color} fade-in`}
    >
      <div className="stat-card-inner">
        <div className="stat-text-col">
          <span className="stat-label">{label}</span>
          <div className="stat-value-row">
            <span className="stat-number">{value}</span>
            {subtext && <span className="stat-subtext">{subtext}</span>}
          </div>
        </div>
        <div className="stat-icon-wrap">
          {Icon && <Icon size={24} />}
        </div>
      </div>

      <style>{`
        .dashboard-stat-card {
          padding: 1.25rem 1.45rem;
          border-radius: var(--radius-xl);
          background: #FFFFFF;
          text-align: left;
        }
        .stat-card-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .stat-text-col {
          display: flex;
          flex-direction: column;
        }
        .stat-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--charcoal-400);
          text-transform: uppercase;
          letter-spacing: 0.03em;
          margin-bottom: 0.35rem;
        }
        .stat-value-row {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }
        .stat-number {
          font-family: var(--font-display);
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--charcoal-900);
          line-height: 1;
        }
        .stat-subtext {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--charcoal-600);
        }
        .stat-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform var(--transition-spring);
        }
        .dashboard-stat-card:hover .stat-icon-wrap {
          transform: scale(1.1) rotate(4deg);
        }
        /* Color variants */
        .stat-coral .stat-icon-wrap {
          background-color: var(--coral-100);
          color: var(--coral-500);
        }
        .stat-peach .stat-icon-wrap {
          background-color: var(--peach-200);
          color: #934612;
        }
        .stat-sage .stat-icon-wrap {
          background-color: var(--sage-100);
          color: var(--sage-600);
        }
        .stat-blue .stat-icon-wrap {
          background-color: var(--dusty-blue-100);
          color: var(--dusty-blue-600);
        }
      `}</style>
    </Card>
  );
}
