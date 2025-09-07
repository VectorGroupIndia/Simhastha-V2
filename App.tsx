
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';

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

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ReportManagement from './pages/admin/ReportManagement';
import FraudDetection from './pages/admin/FraudDetection';
import AnalyticsPage from './pages/admin/AnalyticsPage';


// Authority Pages
import AuthorityDashboard from './pages/authority/AuthorityDashboard';

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
    
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <div className="flex flex-col min-h-screen">
            {!isAdminRoute && <Header />}
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/faq" element={<FaqPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/report" element={<ReportFlowPage />} />
                    
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/users" element={<ProtectedRoute role="admin"><UserManagement /></ProtectedRoute>} />
                    <Route path="/admin/reports" element={<ProtectedRoute role="admin"><ReportManagement /></ProtectedRoute>} />
                    <Route path="/admin/fraud-detection" element={<ProtectedRoute role="admin"><FraudDetection /></ProtectedRoute>} />
                    <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><AnalyticsPage /></ProtectedRoute>} />


                    {/* Authority Routes */}
                    <Route path="/authority" element={<ProtectedRoute role="authority"><AuthorityDashboard /></ProtectedRoute>} />

                    {/* Volunteer Routes */}
                    <Route path="/volunteer" element={<ProtectedRoute role="volunteer"><VolunteerDashboard /></ProtectedRoute>} />
                </Routes>
            </main>
            {!isAdminRoute && <Footer />}
            {showLanguagePopup && <LanguageSelectorPopup onClose={() => setShowLanguagePopup(false)} />}
        </div>
    );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
        <LanguageProvider>
            <Router>
                <AppContent />
            </Router>
        </LanguageProvider>
    </AuthProvider>
  );
};

export default App;