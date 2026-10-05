import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import SearchBar from '../components/common/SearchBar';
import FilterBar from '../components/common/FilterBar';
import ItemCard from '../components/items/ItemCard';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';
import { api } from '../services/api';

export default function FoundItemsPage({ onNavigate, onSelectItem }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadFoundItems();
  }, []);

  const loadFoundItems = async () => {
    setLoading(true);
    try {
      const data = await api.getFoundItems();
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching found items:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items
    .filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (item.ItemName || '').toLowerCase().includes(q);
        const matchesBrand = (item.Brand || '').toLowerCase().includes(q);
        const matchesLoc = (item.FoundLocation || '').toLowerCase().includes(q);
        const matchesColor = (item.Color || '').toLowerCase().includes(q);
        const matchesDesc = (item.Description || '').toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesLoc && !matchesColor && !matchesDesc) {
          return false;
        }
      }
      if (selectedCategory !== 'All Categories') {
        if ((item.Category || '').toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }
      if (statusFilter !== 'All') {
        if ((item.Status || '').toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return (b.FoundID || 0) - (a.FoundID || 0);
      if (sortBy === 'oldest') return (a.FoundID || 0) - (b.FoundID || 0);
      if (sortBy === 'name') return (a.ItemName || '').localeCompare(b.ItemName || '');
      return 0;
    });

  return (
    <div className="found-items-page fade-in">
      <div className="app-container">
        {/* Page Header */}
        <div className="page-header-row">
          <div className="header-titles">
            <span className="page-badge sage">Campus Found Registry</span>
            <h1 className="page-main-title">Turned-In Found Items</h1>
            <p className="page-main-desc">
              Items found by campus helpers and security. See something that looks like yours? Click to view and file an ownership claim.
            </p>
          </div>
          <Button
            variant="secondary"
            size="md"
            icon={PlusCircle}
            onClick={() => onNavigate('report-found')}
          >
            Report Found Item
          </Button>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by title, brand, found location, color, or description..."
            onClear={() => setSearchQuery('')}
          />
        </div>

        {/* Filter Bar */}
        <FilterBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          statusFilter={statusFilter}
          onSelectStatus={setStatusFilter}
          statusOptions={['All', 'Open', 'Claimed', 'Returned']}
          sortBy={sortBy}
          onSelectSort={setSortBy}
        />

        {/* Results Meta */}
        <div className="results-meta-row">
          <span className="results-count">
            Showing <strong>{filteredItems.length}</strong> {filteredItems.length === 1 ? 'found item' : 'found items'}
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

        {/* Items Grid */}
        {loading ? (
          <LoadingState message="Loading campus found items registry..." />
        ) : filteredItems.length > 0 ? (
          <div className="items-grid">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.FoundID}
                item={item}
                type="found"
                onClick={() => onSelectItem(item, 'found')}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No turned-in items found"
            description="If you lost something, submit a lost report and our AI will notify you as soon as someone turns it in!"
            actionLabel="Report Lost Item"
            onAction={() => onNavigate('report-lost')}
          />
        )}
      </div>

      <style>{`
        .found-items-page {
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
        .page-badge.sage {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 800;
          color: var(--sage-600);
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
          max-width: 560px;
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
