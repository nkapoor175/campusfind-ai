import React from 'react';

export default function Card({
  children,
  className = '',
  variant = 'default', // 'default' | 'flat' | 'warm' | 'interactive'
  blob = false,
  padding = 'normal', // 'none' | 'sm' | 'normal' | 'lg'
  onClick,
  ...props
}) {
  const blobClass = blob ? 'blob-card-1' : '';
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`card card-${variant} card-pad-${padding} ${blobClass} ${
        isClickable ? 'pressable is-clickable' : ''
      } ${className}`}
      {...props}
    >
      {children}
      <style>{`
        .card {
          background-color: var(--cream-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          transition: transform var(--transition-spring), box-shadow var(--transition-normal), border-color var(--transition-fast);
        }
        .card-default {
          box-shadow: var(--shadow-sm);
        }
        .card-default:hover {
          box-shadow: var(--shadow-md);
        }
        .card-flat {
          background-color: var(--cream-subtle);
          border-color: var(--border-warm);
          box-shadow: none;
        }
        .card-warm {
          background-color: #FFFDF9;
          border-color: var(--peach-200);
          box-shadow: var(--shadow-sm);
        }
        .card-interactive {
          box-shadow: var(--shadow-sm);
          cursor: pointer;
        }
        .card-interactive:hover {
          border-color: var(--coral-400);
          box-shadow: 0 12px 28px -4px rgba(224, 109, 83, 0.12);
        }
        .card-pad-none { padding: 0; }
        .card-pad-sm { padding: 0.85rem; }
        .card-pad-normal { padding: 1.35rem; }
        .card-pad-lg { padding: 2rem; }
      `}</style>
    </div>
  );
}
