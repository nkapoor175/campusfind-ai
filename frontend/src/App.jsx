import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
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

function MainApp() {
  const { role } = useAuth();
  const [currentRoute, setCurrentRoute] = useState('landing');

  // Modal State for Item Details
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState('lost');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleNavigate = (route) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectItem = (item, type = 'lost') => {
    setSelectedItem(item);
    setSelectedItemType(type);
    setIsDetailModalOpen(true);
  };

  const renderCurrentPage = () => {
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
