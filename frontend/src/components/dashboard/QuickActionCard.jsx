import React from 'react';
import Card from '../common/Card';
import { ArrowRight } from 'lucide-react';

export default function QuickActionCard({
  title,
  description,
  tag,
  illustration,
  theme = 'coral', // 'coral' | 'sage' | 'peach'
  onClick,
}) {
  return (
    <Card
      variant="interactive"
      onClick={onClick}
      className={`quick-action-card theme-${theme} fade-in`}
    >
      <div className="action-text-content">
        {tag && <span className="action-tag">{tag}</span>}
        <h3 className="action-title">{title}</h3>
        <p className="action-desc">{description}</p>
        <div className="action-btn-link">
          <span>Get Started</span>
          <ArrowRight size={16} />
        </div>
      </div>
      <div className="action-illustration-box">
        {illustration}
      </div>

      <style>{`
        .quick-action-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.65rem 1.85rem;
          border-radius: var(--radius-xl);
          background: #FFFFFF;
          position: relative;
          overflow: hidden;
          text-align: left;
        }
        .action-text-content {
          flex: 1;
          z-index: 2;
          max-width: 60%;
        }
        .action-tag {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
          margin-bottom: 0.5rem;
        }
        .action-title {
          font-family: var(--font-display);
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--charcoal-900);
          margin-bottom: 0.35rem;
          line-height: 1.2;
        }
        .action-desc {
          font-size: 0.9rem;
          color: var(--charcoal-600);
          line-height: 1.45;
          margin-bottom: 1rem;
        }
        .action-btn-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-weight: 700;
          font-size: 0.95rem;
          transition: transform var(--transition-fast);
        }
        .quick-action-card:hover .action-btn-link {
          transform: translateX(4px);
        }
        .action-illustration-box {
          flex-shrink: 0;
          z-index: 2;
          transition: transform var(--transition-spring);
        }
        .quick-action-card:hover .action-illustration-box {
          transform: scale(1.08) rotate(3deg);
        }
        /* Theme styles */
        .theme-coral {
          background: linear-gradient(135deg, #FFFFFF, #FFF7F5);
          border: 1.5px solid var(--coral-100);
        }
        .theme-coral .action-tag {
          background: var(--coral-100);
          color: var(--coral-600);
        }
        .theme-coral .action-btn-link {
          color: var(--coral-500);
        }
        .theme-sage {
          background: linear-gradient(135deg, #FFFFFF, #F5FAF6);
          border: 1.5px solid var(--sage-200);
        }
        .theme-sage .action-tag {
          background: var(--sage-100);
          color: var(--sage-600);
        }
        .theme-sage .action-btn-link {
          color: var(--sage-600);
        }
        .theme-peach {
          background: linear-gradient(135deg, #FFFFFF, #FFF9F3);
          border: 1.5px solid var(--peach-200);
        }
        .theme-peach .action-tag {
          background: var(--peach-200);
          color: #934612;
        }
        .theme-peach .action-btn-link {
          color: #934612;
        }
        @media (max-width: 600px) {
          .quick-action-card {
            flex-direction: column;
            align-items: flex-start;
          }
          .action-text-content {
            max-width: 100%;
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </Card>
  );
}
