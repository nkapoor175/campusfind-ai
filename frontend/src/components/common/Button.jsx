import React from 'react';

/**
 * Reusable Cute Button Component
 * Variants: primary (coral/terracotta), secondary (peach), sage, outline, ghost
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} btn-${size} pressable ${className}`}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 16 : 18} className="btn-icon" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 16 : 18} className="btn-icon" />}
        </>
      )}
      <style>{`
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 600;
          border-radius: var(--radius-pill);
          border: 1px solid transparent;
          cursor: pointer;
          transition: all var(--transition-normal);
          white-space: nowrap;
          text-decoration: none;
        }
        .btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }
        /* Sizes */
        .btn-sm {
          padding: 0.4rem 0.9rem;
          font-size: 0.85rem;
        }
        .btn-md {
          padding: 0.65rem 1.35rem;
          font-size: 0.95rem;
        }
        .btn-lg {
          padding: 0.85rem 1.85rem;
          font-size: 1.05rem;
          border-radius: var(--radius-lg);
        }
        /* Variants */
        .btn-primary {
          background-color: var(--coral-500);
          color: #FFFFFF;
          box-shadow: var(--shadow-coral);
        }
        .btn-primary:hover:not(:disabled) {
          background-color: var(--coral-600);
          box-shadow: 0 12px 28px -3px rgba(224, 109, 83, 0.38);
        }
        .btn-secondary {
          background-color: var(--peach-200);
          color: #934612;
          border-color: rgba(244, 162, 97, 0.4);
        }
        .btn-secondary:hover:not(:disabled) {
          background-color: var(--peach-400);
          color: #FFFFFF;
        }
        .btn-sage {
          background-color: var(--sage-100);
          color: var(--sage-600);
          border-color: rgba(109, 151, 117, 0.3);
        }
        .btn-sage:hover:not(:disabled) {
          background-color: var(--sage-500);
          color: #FFFFFF;
        }
        .btn-outline {
          background-color: #FFFFFF;
          color: var(--charcoal-800);
          border: 1.5px solid var(--border-warm);
          box-shadow: var(--shadow-sm);
        }
        .btn-outline:hover:not(:disabled) {
          border-color: var(--coral-500);
          color: var(--coral-500);
          background-color: var(--coral-50);
        }
        .btn-ghost {
          background-color: transparent;
          color: var(--charcoal-600);
        }
        .btn-ghost:hover:not(:disabled) {
          background-color: var(--cream-soft);
          color: var(--charcoal-900);
        }
        /* Spinner */
        .btn-spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}
