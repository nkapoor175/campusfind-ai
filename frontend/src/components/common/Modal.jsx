import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '540px',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-panel fade-in"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            {title && <h3 className="modal-title">{title}</h3>}
            {subtitle && <p className="modal-subtitle">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(30, 34, 45, 0.45);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1.25rem;
          overflow-y: auto;
        }
        .modal-panel {
          width: 100%;
          background: #FFFFFF;
          border-radius: var(--radius-xl);
          border: 1px solid var(--border-subtle);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          margin: auto;
          display: flex;
          flex-direction: column;
          animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes modalPop {
          from {
            opacity: 0;
            transform: scale(0.94) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 1.5rem 1.75rem 1rem 1.75rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        .modal-title {
          font-family: var(--font-display);
          font-size: 1.35rem;
          color: var(--charcoal-900);
          margin-bottom: 0.2rem;
        }
        .modal-subtitle {
          font-size: 0.88rem;
          color: var(--charcoal-400);
          margin: 0;
        }
        .modal-close-btn {
          background: var(--cream-soft);
          border: none;
          color: var(--charcoal-600);
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s;
          flex-shrink: 0;
        }
        .modal-close-btn:hover {
          background: var(--coral-100);
          color: var(--coral-600);
          transform: rotate(90deg);
        }
        .modal-body {
          padding: 1.5rem 1.75rem 1.75rem 1.75rem;
          max-height: 80vh;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}
