import React from 'react';
import { CAMPUS_CATEGORIES } from '../../services/seedData';
import { ArrowUpDown } from 'lucide-react';

export default function FilterBar({
  selectedCategory,
  onSelectCategory,
  statusFilter,
  onSelectStatus,
  statusOptions = ['All', 'Open', 'Matched', 'Closed'],
  sortBy,
  onSelectSort,
  className = '',
}) {
  return (
    <div className={`filter-bar-container ${className}`}>
      {/* Category Pills Slider */}
      <div className="category-pills-row">
        {CAMPUS_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`cat-pill pressable ${isSelected ? 'is-selected' : ''}`}
            >
              {isSelected && <span className="cat-pill-dot" />}
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-filters row: Status and Sort */}
      <div className="filter-controls-row">
        {statusOptions && (
          <div className="status-filter-pills">
            <span className="filter-label">Status:</span>
            {statusOptions.map((st) => {
              const isSelected = (statusFilter || 'All') === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => onSelectStatus(st)}
                  className={`status-chip ${isSelected ? 'active' : ''}`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        )}

        {sortBy && onSelectSort && (
          <div className="sort-select-wrap">
            <ArrowUpDown size={14} className="sort-icon" />
            <select
              value={sortBy}
              onChange={(e) => onSelectSort(e.target.value)}
              className="sort-dropdown"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        )}
      </div>

      <style>{`
        .filter-bar-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .category-pills-row {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.35rem;
          scrollbar-width: thin;
        }
        .cat-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 1rem;
          border-radius: var(--radius-pill);
          background-color: #FFFFFF;
          border: 1.5px solid var(--border-subtle);
          color: var(--charcoal-600);
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition-fast);
        }
        .cat-pill:hover {
          border-color: var(--peach-400);
          color: var(--charcoal-900);
        }
        .cat-pill.is-selected {
          background-color: var(--coral-500);
          border-color: var(--coral-500);
          color: #FFFFFF;
          box-shadow: 0 4px 14px -2px rgba(224, 109, 83, 0.3);
        }
        .cat-pill-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #FFFFFF;
        }
        .filter-controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .status-filter-pills {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-wrap: wrap;
        }
        .filter-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--charcoal-400);
          margin-right: 0.2rem;
        }
        .status-chip {
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-pill);
          font-size: 0.8rem;
          font-weight: 600;
          background: var(--cream-soft);
          border: 1px solid transparent;
          color: var(--charcoal-600);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .status-chip:hover {
          background: var(--peach-200);
          color: #934612;
        }
        .status-chip.active {
          background: var(--charcoal-900);
          color: #FFFFFF;
        }
        .sort-select-wrap {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #FFFFFF;
          border: 1px solid var(--border-warm);
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-pill);
          font-size: 0.82rem;
        }
        .sort-icon {
          color: var(--coral-500);
        }
        .sort-dropdown {
          border: none;
          background: transparent;
          outline: none;
          font-family: inherit;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--charcoal-800);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
