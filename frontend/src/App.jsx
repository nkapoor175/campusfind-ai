import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { onSessionExpired } from './services/api';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DemoModeBanner from './components/common/DemoModeBanner';
import ItemDetailModal from './components/items/ItemDetailModal';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import LostItemsPage from './pages/LostItemsPage';
import FoundItemsPage from './pages/FoundItemsPage';
import ReportLostPage from './pages/ReportLostPage';
import ReportFoundPage from './pages/ReportFoundPage';
import NotificationsPage from './pages/NotificationsPage';
import ClaimsPage from './pages/ClaimsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminManagementPage from './pages/AdminManagementPage';

const PRIVATE_ROUTES = [
  'dashboard',
  'claims',
  'notifications',
  'report-lost',
  'report-found',
  'admin-dashboard',
  'admin-management',
];

function MainApp() {
  const { user, token, logout } = useAuth();
  const isAuthenticated = Boolean(user && token);
  const toast = useToast();
  const [currentRoute, setCurrentRoute] = useState('landing');

  // Modal State for Item Details
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState('lost');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    const handleSessionExpired = (detail) => {
      logout();
      setCurrentRoute('login');
      const msg =
        (typeof detail === 'string' ? detail : detail?.detail?.message) ||
        'Session expired, please sign in again';
      toast.error(msg);
    };

    return onSessionExpired(handleSessionExpired);
  }, [logout, toast]);

  useEffect(() => {
    if (!isAuthenticated && PRIVATE_ROUTES.includes(currentRoute)) {
      setCurrentRoute('login');
    }
  }, [isAuthenticated, currentRoute]);

  const handleNavigate = (route) => {
    // No auth check here: a login page calls this right after signing in, while its copy of
    // isAuthenticated is still stale. The render guard + effect above redirect unauthenticated users.
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectItem = (item, type = 'lost') => {
    setSelectedItem(item);
    setSelectedItemType(type);
    setIsDetailModalOpen(true);
  };

  const renderCurrentPage = () => {
    if (!isAuthenticated && PRIVATE_ROUTES.includes(currentRoute)) {
      return <LoginPage onNavigate={handleNavigate} />;
    }

    switch (currentRoute) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case 'dashboard':
        return (
          <DashboardPage
            onNavigate={handleNavigate}
            onSelectItem={handleSelectItem}
          />
        );
      case 'lost-items':
        return (
          <LostItemsPage
            onNavigate={handleNavigate}
            onSelectItem={(item) => handleSelectItem(item, 'lost')}
          />
        );
      case 'found-items':
        return (
          <FoundItemsPage
            onNavigate={handleNavigate}
            onSelectItem={(item) => handleSelectItem(item, 'found')}
          />
        );
      case 'report-lost':
        return <ReportLostPage onNavigate={handleNavigate} />;
      case 'report-found':
        return <ReportFoundPage onNavigate={handleNavigate} />;
      case 'notifications':
        return <NotificationsPage onNavigate={handleNavigate} />;
      case 'claims':
        return (
          <ClaimsPage
            onNavigate={handleNavigate}
            onSelectItem={handleSelectItem}
          />
        );
      case 'admin-dashboard':
        return (
          <AdminDashboardPage
            onNavigate={handleNavigate}
            onSelectItem={handleSelectItem}
          />
        );
      case 'admin-management':
        return (
          <AdminManagementPage
            onNavigate={handleNavigate}
            onSelectItem={handleSelectItem}
          />
        );
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="app-root">
      <Navbar currentRoute={currentRoute} onNavigate={handleNavigate} />
      <DemoModeBanner />
      <main className="main-content">{renderCurrentPage()}</main>
      <Footer onNavigate={handleNavigate} />

      {/* Global Item Details & Match Modal */}
      <ItemDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        item={selectedItem}
        type={selectedItemType}
        onClaimSubmitted={() => {
          setIsDetailModalOpen(false);
          handleNavigate('claims');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
}
