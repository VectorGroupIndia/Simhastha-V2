import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';

const DashboardIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const CctvIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;

const AuthoritySidebar: React.FC = () => {
    const { t } = useLanguage();
    
    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`;

    const navItems = [
        { to: "/authority", icon: <DashboardIcon />, text: t.authoritySidebarDashboard, exact: true },
        { to: "/authority/cctv-monitoring", icon: <CctvIcon />, text: t.authoritySidebarCCTV },
    ];

    return (
        <aside className="w-64 bg-white shadow-lg h-screen sticky top-0 flex flex-col">
            <div className="p-6 border-b">
                <Link to="/authority">
                    <span className="text-3xl font-bold text-brand-dark">found<span className="text-brand-primary">tastic</span></span>
                </Link>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map(item => (
                    <NavLink key={item.to} to={item.to} end={item.exact} className={navLinkClass}>
                        {item.icon}
                        <span className="ml-3 font-medium">{item.text}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t">
                <Link to="/" className="text-sm text-center text-gray-500 hover:text-brand-primary">
                    Back to Main Site &rarr;
                </Link>
            </div>
        </aside>
    );
};

export default AuthoritySidebar;
