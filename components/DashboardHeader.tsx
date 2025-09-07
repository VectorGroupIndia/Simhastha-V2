

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardHeaderProps {
    title: string;
}

const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);
const LogoutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title }) => {
    const { user, logout } = useAuth();
    const { t } = useLanguage();

    return (
        <header className="bg-white shadow-md p-4 mb-8 flex justify-between items-center rounded-lg">
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 hidden sm:block">Welcome, <strong className="font-semibold">{user?.name}</strong></span>
                <Link to="/" className="flex items-center text-sm font-medium text-brand-primary hover:underline">
                    <HomeIcon />
                    Home
                </Link>
                <button onClick={logout} className="flex items-center text-sm font-medium text-red-600 hover:underline">
                    <LogoutIcon />
                    {t.navLogout}
                </button>
            </div>
        </header>
    );
};

export default DashboardHeader;