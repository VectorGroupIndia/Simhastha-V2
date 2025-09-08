import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { NotificationProvider } from './contexts/NotificationContext';

import Header from './components/Header';
import Footer from './components/Footer';
import LanguageSelectorPopup from './components/LanguageSelectorPopup';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FaqPage from './pages/FaqPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ReportFlowPage from './pages/ReportFlowPage';
import MyGroupPage from './pages/MyGroupPage';
import LiveMapPage from './pages/LiveMapPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ReportManagement from './pages/admin/ReportManagement';
import FraudDetection from './pages/admin/FraudDetection';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import SettingsPage from './pages/admin/SettingsPage';


// Authority Pages
import AuthorityDashboard from './pages/authority/AuthorityDashboard';
import CCTVMonitoringPage from './pages/authority/CCTVMonitoringPage';

// Volunteer Pages
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';

const AppContent: React.FC = () => {
    const [showLanguagePopup, setShowLanguagePopup] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const hasVisited = localStorage.getItem('foundtastic-visited');
        if (!hasVisited) {
            setShowLanguagePopup(true);
            localStorage.setItem('foundtastic-visited', 'true');
        }
    }, []);
    
    const isHomePage = location.pathname === '/';
    const isDashboardPage = location.pathname.startsWith('/admin') || 
                            location.pathname.startsWith('/authority') || 
                            location.pathname.startsWith('/volunteer');

    let pageClasses = '';
    if (isHomePage) {
        pageClasses = 'bg-brand-bg';
    } else if (isDashboardPage) {
        // Dashboards have their own BG, so we don't apply one here.
        pageClasses = '';
    } else {
        pageClasses = 'bg-brand-glass-bg text-white';
    }

    return (
        <div className={`flex flex-col min-h-screen ${pageClasses}`}>
            {!isDashboardPage && <Header />}
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/faq" element={<FaqPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/report" element={<ReportFlowPage />} />
                    
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="/my-group" element={<ProtectedRoute role="user"><MyGroupPage /></ProtectedRoute>} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/users" element={<ProtectedRoute role="admin"><UserManagement /></ProtectedRoute>} />
                    <Route path="/admin/reports" element={<ProtectedRoute role="admin"><ReportManagement /></ProtectedRoute>} />
                    <Route path="/admin/fraud-detection" element={<ProtectedRoute role="admin"><FraudDetection /></ProtectedRoute>} />
                    <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><AnalyticsPage /></ProtectedRoute>} />
                    <Route path="/admin/settings" element={<ProtectedRoute role="admin"><SettingsPage /></ProtectedRoute>} />


                    {/* Authority Routes */}
                    <Route path="/authority" element={<ProtectedRoute role="authority"><AuthorityDashboard /></ProtectedRoute>} />
                    <Route path="/authority/cctv-monitoring" element={<ProtectedRoute role="authority"><CCTVMonitoringPage /></ProtectedRoute>} />

                    {/* Volunteer Routes */}
                    <Route path="/volunteer" element={<ProtectedRoute role="volunteer"><VolunteerDashboard /></ProtectedRoute>} />
                </Routes>
            </main>
            {!isDashboardPage && <Footer />}
            {showLanguagePopup && <LanguageSelectorPopup onClose={() => setShowLanguagePopup(false)} />}
        </div>
    );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
        <LanguageProvider>
            <NotificationProvider>
                <Router>
                    <AppContent />
                </Router>
            </NotificationProvider>
        </LanguageProvider>
    </AuthProvider>
  );
};

export default App;