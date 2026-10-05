import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, Sparkles, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    match: (msg, dur) => addToast(msg, 'match', dur),
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={20} className="toast-icon success" />;
      case 'error':
        return <AlertCircle size={20} className="toast-icon error" />;
      case 'match':
        return <Sparkles size={20} className="toast-icon match" />;
      default:
        return <Info size={20} className="toast-icon info" />;
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-card toast-${t.type} fade-in`}>
            <div className="toast-icon-wrap">{getIcon(t.type)}</div>
            <div className="toast-message">{t.message}</div>
            <button
              onClick={() => removeToast(t.id)}
              className="toast-close-btn"
              aria-label="Close notification"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        .toast-container {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          z-index: 9999;
          max-width: 380px;
          pointer-events: none;
        }
        .toast-card {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          background: #FFFFFF;
          padding: 0.85rem 1.15rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
          box-shadow: var(--shadow-lg);
          color: var(--charcoal-900);
          font-size: 0.92rem;
          font-weight: 500;
        }
        .toast-success {
          border-left: 5px solid var(--sage-500);
        }
        .toast-error {
          border-left: 5px solid #E63946;
        }
        .toast-match {
          border-left: 5px solid var(--peach-500);
          background: #FFFBF7;
        }
        .toast-info {
          border-left: 5px solid var(--coral-500);
        }
        .toast-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .toast-icon.success { color: var(--sage-500); }
        .toast-icon.error { color: #E63946; }
        .toast-icon.match { color: var(--peach-500); }
        .toast-icon.info { color: var(--coral-500); }
        .toast-message {
          flex: 1;
          line-height: 1.4;
        }
        .toast-close-btn {
          background: transparent;
          border: none;
          color: var(--charcoal-400);
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }
        .toast-close-btn:hover {
          background: var(--cream-soft);
          color: var(--charcoal-800);
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
