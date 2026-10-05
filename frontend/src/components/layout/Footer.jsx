import React from 'react';
import { Heart, Sparkles, Shield, Compass, BookOpen } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="footer-wrap">
      <div className="app-container footer-content">
        <div className="footer-brand-col">
          <div className="footer-logo">
            <span className="footer-logo-title">CampusFind<span className="brand-ai">AI</span></span>
          </div>
          <p className="footer-tagline">
            "Lost something? We'll help you find it."
          </p>
          <p className="footer-desc">
            A playful, smart campus lost-and-found matching system designed to reunite students with their favorite items quickly and safely.
          </p>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-col-title">Campus Hub</h4>
          <button type="button" onClick={() => onNavigate('dashboard')} className="footer-link">
            Student Dashboard
          </button>
          <button type="button" onClick={() => onNavigate('lost-items')} className="footer-link">
            Browse Lost Items
          </button>
          <button type="button" onClick={() => onNavigate('found-items')} className="footer-link">
            Browse Found Items
          </button>
          <button type="button" onClick={() => onNavigate('report-lost')} className="footer-link">
            Report a Lost Item
          </button>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-col-title">Security &amp; Admin</h4>
          <button type="button" onClick={() => onNavigate('admin-dashboard')} className="footer-link">
            Admin Verification Desk
          </button>
          <button type="button" onClick={() => onNavigate('claims')} className="footer-link">
            Claims Resolution
          </button>
          <button type="button" onClick={() => onNavigate('admin-management')} className="footer-link">
            System Management CRUD
          </button>
        </div>

        <div className="footer-card-col">
          <div className="footer-tip-card">
            <div className="tip-header">
              <Sparkles size={16} className="tip-sparkle" />
              <span>Campus Pro Tip</span>
            </div>
            <p className="tip-text">
              Always mention identifiable marks like stickers, dents, or keychains in your item report. This improves AI match confidence!
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="app-container footer-bottom-inner">
          <p className="footer-copy">
            Crafted with <Heart size={13} fill="#E06D53" stroke="none" /> for college campus communities. CampusFind AI Project.
          </p>
          <div className="footer-badges">
            <span className="badge badge-sage">Node.js + Express</span>
            <span className="badge badge-peach">Python AI Matcher</span>
            <span className="badge badge-blue">MySQL 9-Table Schema</span>
          </div>
        </div>
      </div>

      <style>{`
        .footer-wrap {
          background-color: #FFFFFF;
          border-top: 1px solid var(--border-subtle);
          padding-top: 3.5rem;
          margin-top: auto;
        }
        .footer-content {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: 2.5rem;
          padding-bottom: 3rem;
        }
        .footer-logo-title {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--charcoal-900);
        }
        .footer-tagline {
          font-family: var(--font-display);
          font-size: 1rem;
          font-weight: 600;
          color: var(--coral-500);
          margin: 0.4rem 0 0.5rem 0;
        }
        .footer-desc {
          font-size: 0.88rem;
          color: var(--charcoal-600);
          line-height: 1.5;
          max-width: 320px;
        }
        .footer-col-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--charcoal-900);
          margin-bottom: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .footer-links-col {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }
        .footer-link {
          background: transparent;
          border: none;
          padding: 0;
          text-align: left;
          font-size: 0.9rem;
          color: var(--charcoal-600);
          cursor: pointer;
          transition: color 0.15s;
        }
        .footer-link:hover {
          color: var(--coral-500);
        }
        .footer-tip-card {
          background: #FFFDF9;
          border: 1.5px dashed var(--peach-400);
          border-radius: var(--radius-lg);
          padding: 1.15rem;
        }
        .tip-header {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-weight: 700;
          font-size: 0.88rem;
          color: #934612;
          margin-bottom: 0.35rem;
        }
        .tip-sparkle {
          color: var(--peach-500);
        }
        .tip-text {
          font-size: 0.82rem;
          color: var(--charcoal-600);
          line-height: 1.45;
          margin: 0;
        }
        .footer-bottom-bar {
          border-top: 1px solid var(--border-subtle);
          padding: 1.25rem 0;
          background: var(--cream-soft);
        }
        .footer-bottom-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .footer-copy {
          font-size: 0.82rem;
          color: var(--charcoal-600);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .footer-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        @media (max-width: 900px) {
          .footer-content {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 600px) {
          .footer-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
}
