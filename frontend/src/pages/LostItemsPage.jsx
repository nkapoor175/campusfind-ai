import React, { useState, useEffect } from 'react';
import { PlusCircle, PackageSearch } from 'lucide-react';
import SearchBar from '../components/common/SearchBar';
import FilterBar from '../components/common/FilterBar';
import ItemCard from '../components/items/ItemCard';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';
import { api } from '../services/api';

export default function LostItemsPage({ onNavigate, onSelectItem }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadLostItems();
  }, []);

  const loadLostItems = async () => {
    setLoading(true);
    try {
      const data = await api.getLostItems();
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching lost items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter & Search Logic
  const filteredItems = items
    .filter((item) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (item.ItemName || '').toLowerCase().includes(q);
        const matchesBrand = (item.Brand || '').toLowerCase().includes(q);
        const matchesLoc = (item.LostLocation || '').toLowerCase().includes(q);
        const matchesColor = (item.Color || '').toLowerCase().includes(q);
        const matchesDesc = (item.Description || '').toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesLoc && !matchesColor && !matchesDesc) {
          return false;
        }
      }
      // Category filter
      if (selectedCategory !== 'All Categories') {
        if ((item.Category || '').toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }
      // Status filter
      if (statusFilter !== 'All') {
        if ((item.Status || '').toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return (b.LostID || 0) - (a.LostID || 0);
      if (sortBy === 'oldest') return (a.LostID || 0) - (b.LostID || 0);
      if (sortBy === 'name') return (a.ItemName || '').localeCompare(b.ItemName || '');
      return 0;
    });

  return (
    <div className="lost-items-page fade-in">
      <div className="app-container">
        {/* Page Header */}
        <div className="page-header-row">
          <div className="header-titles">
            <span className="page-badge">Campus Lost Registry</span>
            <h1 className="page-main-title">Lost Items on Campus</h1>
            <p className="page-main-desc">
              Browse through currently reported lost items. Click an item to view details and candidate matches.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={PlusCircle}
            onClick={() => onNavigate('report-lost')}
          >
            Report Lost Item
          </Button>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by title, brand, campus location, color, or description..."
            onClear={() => setSearchQuery('')}
          />
        </div>

        {/* Filter Bar */}
        <FilterBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          statusFilter={statusFilter}
          onSelectStatus={setStatusFilter}
          statusOptions={['All', 'Open', 'Matched', 'Closed']}
          sortBy={sortBy}
          onSelectSort={setSortBy}
        />

        {/* Results Count & Active Tags */}
        <div className="results-meta-row">
          <span className="results-count">
            Showing <strong>{filteredItems.length}</strong> {filteredItems.length === 1 ? 'lost item' : 'lost items'}
          </span>
          {(searchQuery || selectedCategory !== 'All Categories' || statusFilter !== 'All') && (
            <button
              type="button"
              className="clear-all-filters-btn"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All Categories');
                setStatusFilter('All');
              }}
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Cards Grid / Empty / Loading */}
        {loading ? (
          <LoadingState message="Loading campus lost items registry..." />
        ) : filteredItems.length > 0 ? (
          <div className="items-grid">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.LostID}
                item={item}
                type="lost"
                hasMatch={item.Status === 'Matched'}
                onClick={() => onSelectItem(item, 'lost')}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No matching lost items found"
            description="Try changing your search keywords or switching category filters."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('All Categories');
              setStatusFilter('All');
            }}
          />
        )}
      </div>

      <style>{`
        .lost-items-page {
          padding: 2rem 0;
          text-align: left;
        }
        .page-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .page-badge {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 800;
          color: var(--coral-500);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.35rem;
        }
        .page-main-title {
          font-size: clamp(2rem, 3.5vw, 2.5rem);
          font-weight: 800;
          color: var(--charcoal-900);
          margin-bottom: 0.35rem;
        }
        .page-main-desc {
          font-size: 1rem;
          color: var(--charcoal-600);
          max-width: 540px;
          margin: 0;
        }
        .search-section {
          margin-bottom: 1.25rem;
        }
        .results-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.88rem;
          color: var(--charcoal-600);
          margin-bottom: 1.25rem;
        }
        .clear-all-filters-btn {
          background: transparent;
          border: none;
          color: var(--coral-500);
          font-weight: 700;
          cursor: pointer;
        }
        .clear-all-filters-btn:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
