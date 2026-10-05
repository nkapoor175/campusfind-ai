import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search by item name, location, brand...',
  onClear,
  className = '',
}) {
  return (
    <div className={`search-bar-wrap ${className}`}>
      <Search size={18} className="search-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            if (onClear) onClear();
          }}
          className="search-clear-btn"
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}

      <style>{`
        .search-bar-wrap {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          background: #FFFFFF;
          border: 1.5px solid var(--border-warm);
          border-radius: var(--radius-pill);
          padding: 0.6rem 1.15rem;
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-fast);
          width: 100%;
        }
        .search-bar-wrap:focus-within {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3.5px rgba(224, 109, 83, 0.14);
        }
        .search-icon {
          color: var(--coral-500);
          flex-shrink: 0;
        }
        .search-input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-family: inherit;
          font-size: 0.95rem;
          color: var(--charcoal-900);
        }
        .search-input::placeholder {
          color: var(--charcoal-400);
        }
        .search-clear-btn {
          background: var(--cream-soft);
          border: none;
          color: var(--charcoal-600);
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
        }
        .search-clear-btn:hover {
          background: var(--peach-200);
          color: var(--charcoal-900);
        }
      `}</style>
    </div>
  );
}
