import React from 'react';
import { CampusMascot } from '../../assets/illustrations/IllustratedIcons';

export default function LoadingState({ message = 'Searching campus reports with AI...' }) {
  return (
    <div className="loading-state-wrap fade-in">
      <div className="loading-mascot animate-soft-pulse">
        <CampusMascot size={90} />
      </div>
      <p className="loading-message">{message}</p>
      <div className="loading-dots">
        <span />
        <span />
        <span />
      </div>

      <style>{`
        .loading-state-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 1.5rem;
          text-align: center;
        }
        .loading-mascot {
          margin-bottom: 1.25rem;
        }
        .loading-message {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--charcoal-800);
          margin-bottom: 0.75rem;
        }
        .loading-dots {
          display: flex;
          gap: 0.4rem;
        }
        .loading-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--coral-500);
          animation: dotBounce 1.2s infinite ease-in-out;
        }
        .loading-dots span:nth-child(2) {
          animation-delay: 0.2s;
          background-color: var(--peach-500);
        }
        .loading-dots span:nth-child(3) {
          animation-delay: 0.4s;
          background-color: var(--sage-500);
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
