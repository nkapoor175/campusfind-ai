import React, { useState, useEffect } from 'react';
import { Sparkles, WifiOff } from 'lucide-react';
import { isDemoFallbackEnabled, isDemoFallbackActive, subscribeToDemoFallback } from '../../services/api';

/**
 * Offline Demo Mode Banner
 *
 * Visually consistent with CampusFind AI's warm, friendly design identity.
 * Only appears when demo fallback is enabled and fallback sample data is actively being served.
 */
export default function DemoModeBanner() {
  const [active, setActive] = useState(() => isDemoFallbackEnabled() && isDemoFallbackActive());

  useEffect(() => {
    if (!isDemoFallbackEnabled()) {
      return;
    }
    return subscribeToDemoFallback((isFallback) => {
      setActive(isFallback);
    });
  }, []);

  if (!isDemoFallbackEnabled() || !active) return null;

  return (
    <aside className="demo-mode-banner fade-in" role="status" aria-live="polite">
      <div className="app-container banner-inner">
        <div className="banner-left">
          <span className="demo-chip">
            <Sparkles size={13} className="demo-icon" /> Demo Mode
          </span>
          <span className="banner-text">
            <strong>Offline Demo Mode</strong> · Showing sample data
          </span>
        </div>
        <div className="banner-right">
          <span className="demo-subtle-hint">
            <WifiOff size={13} /> Sample Data Active
          </span>
        </div>
      </div>
      <style>{`
        .demo-mode-banner {
          background: linear-gradient(90deg, #FFF7ED 0%, #FEF2F2 50%, #FFF7ED 100%);
          border-bottom: 1.5px solid #FDBA74;
          padding: 0.55rem 1rem;
          color: #9A3412;
          font-size: 0.85rem;
          box-shadow: 0 2px 8px rgba(234, 88, 12, 0.08);
          position: sticky;
          top: 0;
          z-index: 99;
          backdrop-filter: blur(8px);
        }
        .banner-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .banner-left {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;
        }
        .demo-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: #EA580C;
          color: #FFFFFF;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          padding: 0.18rem 0.6rem;
          border-radius: 9999px;
          box-shadow: 0 1px 3px rgba(234, 88, 12, 0.3);
        }
        .demo-icon {
          animation: spin-soft 4s linear infinite;
        }
        @keyframes spin-soft {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .banner-text {
          color: #7C2D12;
          font-size: 0.84rem;
        }
        .banner-text strong {
          color: #9A3412;
          font-weight: 700;
        }
        .banner-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .demo-subtle-hint {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.76rem;
          color: #C2410C;
          background: rgba(255, 237, 213, 0.6);
          padding: 0.15rem 0.5rem;
          border-radius: 9999px;
          border: 1px solid rgba(251, 146, 60, 0.4);
        }
        @media (max-width: 640px) {
          .banner-right {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
}
