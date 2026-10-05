import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  Search,
  PlusCircle,
  Shield,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  Layers,
  Inbox,
  FileCheck2,
} from 'lucide-react';
import Button from '../common/Button';

export default function Navbar({ currentRoute, onNavigate }) {
  const { user, role, unreadCount, logout, switchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const studentNavItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'lost-items', label: 'Lost Items' },
    { id: 'found-items', label: 'Found Items' },
    { id: 'claims', label: 'My Claims' },
  ];

  const adminNavItems = [
    { id: 'admin-dashboard', label: 'Admin Desk' },
    { id: 'admin-management', label: 'All Items & CRUD' },
    { id: 'claims', label: 'Claims Review' },
  ];

  const navItems = role === 'admin' ? adminNavItems : studentNavItems;

  const handleNavClick = (id) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-header">
      <div className="app-container navbar-inner">
        {/* Brand Wordmark & Logo */}
        <div className="brand-wrap pressable" onClick={() => handleNavClick(role === 'admin' ? 'admin-dashboard' : 'landing')}>
          <div className="brand-logo-mark">
            <svg width="34" height="34" viewBox="0 0 100 100" fill="none">
              <rect x="14" y="24" width="72" height="66" rx="24" fill="#E06D53" />
              <ellipse cx="50" cy="24" rx="20" ry="12" fill="#F4A261" />
              <circle cx="40" cy="50" r="5" fill="#FAF7F2" />
              <circle cx="60" cy="50" r="5" fill="#FAF7F2" />
              <path d="M46 62Q50 66 54 62" stroke="#FAF7F2" strokeWidth="3" strokeLinecap="round" />
              <path d="M72 16L74 10L76 16L82 18L76 20L74 26L72 20L66 18L72 16Z" fill="#F4A261" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-name">CampusFind<span className="brand-ai">AI</span></span>
            <span className="brand-tagline">Smart Campus Lost &amp; Found</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav-links">
          {navItems.map((item) => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`nav-link-btn ${isActive ? 'active' : ''}`}
              >
                {item.label}
                {isActive && <span className="nav-active-pill" />}
              </button>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="navbar-actions">
          {/* Quick Role Switcher (Crucial for Professor / Evaluator Demo) */}
          <button
            type="button"
            onClick={() => switchRole(role === 'admin' ? 'student' : 'admin')}
            className={`role-toggle-pill ${role === 'admin' ? 'is-admin' : ''}`}
            title="Click to toggle between Student and Admin perspective"
          >
            {role === 'admin' ? (
              <>
                <Shield size={14} /> Admin Mode
              </>
            ) : (
              <>
                <User size={14} /> Student View
              </>
            )}
          </button>

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={() => handleNavClick('notifications')}
            className="notif-bell-btn pressable"
            aria-label="View notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="notif-badge-bubble">{unreadCount}</span>
            )}
          </button>

          {/* Quick Action: Report Lost / Found (Student only) */}
          {role === 'student' && (
            <div className="nav-report-btns">
              <Button
                variant="primary"
                size="sm"
                icon={PlusCircle}
                onClick={() => handleNavClick('report-lost')}
              >
                Report Lost
              </Button>
            </div>
          )}

          {/* User Profile / Menu */}
          <div className="user-menu-wrap">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="user-avatar-btn pressable"
              title={user?.Name || 'User profile'}
            >
              <div className="avatar-initials">
                {user?.Name ? user.Name.charAt(0) : 'U'}
              </div>
            </button>

            {userDropdownOpen && (
              <div className="user-dropdown-card fade-in">
                <div className="dropdown-user-info">
                  <p className="dropdown-user-name">{user?.Name || 'Campus Student'}</p>
                  <p className="dropdown-user-email">{user?.Email || 'student@campus.edu'}</p>
                  <span className="badge badge-peach" style={{ marginTop: '0.25rem' }}>
                    {role === 'admin' ? 'Security Admin' : user?.Department || 'Student'}
                  </span>
                </div>
                <div className="dropdown-divider" />
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    handleNavClick('dashboard');
                  }}
                  className="dropdown-item"
                >
                  <User size={16} /> My Profile &amp; Reports
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    handleNavClick('notifications');
                  }}
                  className="dropdown-item"
                >
                  <Bell size={16} /> Notifications ({unreadCount})
                </button>
                <div className="dropdown-divider" />
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                    handleNavClick('login');
                  }}
                  className="dropdown-item logout"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger toggle */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer fade-in">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`mobile-nav-link ${currentRoute === item.id ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
          <div className="mobile-drawer-divider" />
          <div className="mobile-cta-row">
            <Button
              variant="primary"
              size="md"
              onClick={() => handleNavClick('report-lost')}
              className="w-full"
            >
              Report Lost Item
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => handleNavClick('report-found')}
              className="w-full"
            >
              Report Found Item
            </Button>
          </div>
        </div>
      )}

      <style>{`
        .navbar-header {
          position: sticky;
          top: 0;
          z-index: 500;
          background: rgba(250, 247, 242, 0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-subtle);
          padding: 0.75rem 0;
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .brand-wrap {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }
        .brand-logo-mark {
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 4px 8px rgba(224, 109, 83, 0.2));
        }
        .brand-text {
          display: flex;
          flex-direction: column;
        }
        .brand-name {
          font-family: var(--font-display);
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--charcoal-900);
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .brand-ai {
          color: var(--coral-500);
          margin-left: 2px;
          background: var(--coral-100);
          padding: 1px 6px;
          border-radius: var(--radius-sm);
          font-size: 0.85em;
        }
        .brand-tagline {
          font-size: 0.72rem;
          color: var(--charcoal-400);
          font-weight: 500;
        }
        .desktop-nav-links {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .nav-link-btn {
          position: relative;
          background: transparent;
          border: none;
          padding: 0.55rem 0.95rem;
          font-family: var(--font-body);
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--charcoal-600);
          cursor: pointer;
          border-radius: var(--radius-pill);
          transition: all var(--transition-fast);
        }
        .nav-link-btn:hover {
          color: var(--charcoal-900);
          background-color: var(--cream-soft);
        }
        .nav-link-btn.active {
          color: var(--coral-600);
          background-color: var(--coral-100);
        }
        .nav-active-pill {
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
          width: 14px;
          height: 3px;
          background-color: var(--coral-500);
          border-radius: var(--radius-pill);
        }
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .role-toggle-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-pill);
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          background: var(--cream-soft);
          border: 1.5px solid var(--border-warm);
          color: var(--charcoal-800);
          transition: all var(--transition-fast);
        }
        .role-toggle-pill:hover {
          background: var(--peach-200);
          border-color: var(--peach-400);
        }
        .role-toggle-pill.is-admin {
          background: var(--sage-100);
          border-color: var(--sage-500);
          color: var(--sage-600);
        }
        .notif-bell-btn {
          position: relative;
          background: #FFFFFF;
          border: 1.5px solid var(--border-warm);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--charcoal-800);
          cursor: pointer;
          box-shadow: var(--shadow-sm);
        }
        .notif-badge-bubble {
          position: absolute;
          top: -2px;
          right: -2px;
          background-color: var(--coral-500);
          color: #FFFFFF;
          font-size: 0.7rem;
          font-weight: 700;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #FFFFFF;
        }
        .user-menu-wrap {
          position: relative;
        }
        .user-avatar-btn {
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .avatar-initials {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--peach-400), var(--coral-500));
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.05rem;
          border: 2px solid #FFFFFF;
          box-shadow: var(--shadow-sm);
        }
        .user-dropdown-card {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 240px;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          padding: 1rem;
          z-index: 600;
          text-align: left;
        }
        .dropdown-user-info {
          margin-bottom: 0.5rem;
        }
        .dropdown-user-name {
          font-weight: 700;
          color: var(--charcoal-900);
          margin: 0;
          font-size: 0.95rem;
        }
        .dropdown-user-email {
          font-size: 0.78rem;
          color: var(--charcoal-400);
          margin: 0;
        }
        .dropdown-divider {
          height: 1px;
          background-color: var(--border-subtle);
          margin: 0.65rem 0;
        }
        .dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.55rem 0.5rem;
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          font-size: 0.88rem;
          color: var(--charcoal-800);
          cursor: pointer;
          transition: background 0.15s;
          text-align: left;
        }
        .dropdown-item:hover {
          background-color: var(--cream-soft);
        }
        .dropdown-item.logout {
          color: #E63946;
        }
        .dropdown-item.logout:hover {
          background-color: #FDF2F2;
        }
        .mobile-menu-toggle {
          display: none;
          background: transparent;
          border: none;
          color: var(--charcoal-800);
          cursor: pointer;
        }
        .mobile-nav-drawer {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1.25rem 1.5rem;
          background: #FFFFFF;
          border-top: 1px solid var(--border-subtle);
        }
        .mobile-nav-link {
          text-align: left;
          padding: 0.75rem;
          background: transparent;
          border: none;
          font-size: 1rem;
          font-weight: 600;
          color: var(--charcoal-800);
          border-radius: var(--radius-md);
        }
        .mobile-nav-link.active {
          background-color: var(--coral-100);
          color: var(--coral-600);
        }
        .mobile-drawer-divider {
          height: 1px;
          background: var(--border-subtle);
          margin: 0.5rem 0;
        }
        .mobile-cta-row {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        @media (max-width: 900px) {
          .desktop-nav-links { display: none; }
          .nav-report-btns { display: none; }
          .mobile-menu-toggle { display: block; }
        }
      `}</style>
    </header>
  );
}
