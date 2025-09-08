import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangDropdownOpen, setLangDropdownOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform ${isActive ? 'bg-white/20 text-white shadow-lg' : 'text-slate-300 hover:bg-white/10 hover:text-white hover:scale-105'}`;

  const getDashboardLink = () => {
    if (!user) return null;
    switch (user.role) {
      case 'admin':
        return { path: '/admin', name: t.navAdminDashboard };
      case 'authority':
        return { path: '/authority', name: t.navAuthorityDashboard };
      case 'volunteer':
        return { path: '/volunteer', name: t.navVolunteerDashboard };
      default:
        return { path: '/profile', name: t.navProfile };
    }
  };

  const dashboardLink = getDashboardLink();
  
  const languageAbbreviation: Record<string, string> = {
    'English': 'EN',
    'हिंदी': 'HI',
    'मराठी': 'MA'
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mt-4 flex items-center justify-between p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Foundtastic</span>
              <span className="text-2xl font-bold text-white">found<span className="text-brand-secondary">tastic</span></span>
            </Link>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-slate-300"
              onClick={() => setIsMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-2">
            <NavLink to="/" className={navLinkClass}>{t.navHome}</NavLink>
            <NavLink to="/about" className={navLinkClass}>{t.navAbout}</NavLink>
            <NavLink to="/contact" className={navLinkClass}>{t.navContact}</NavLink>
            <NavLink to="/faq" className={navLinkClass}>{t.navFaq}</NavLink>
            {(!user || user.role === 'user') && (
              <NavLink to="/report" className={navLinkClass}>{t.navReport}</NavLink>
            )}
            {user && (
                 <NavLink to="/live-map" className={navLinkClass}>Live Map</NavLink>
            )}
            {user && user.role === 'user' && (
                <NavLink to="/my-group" className={navLinkClass}>{t.navMyGroup}</NavLink>
            )}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-x-6">
            <div className="relative">
              <button onClick={() => setLangDropdownOpen(!isLangDropdownOpen)} className="flex items-center gap-x-1 text-sm font-semibold text-slate-300 hover:text-white">
                  {languageAbbreviation[language] || 'EN'}
                <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-28 origin-top-right rounded-md bg-white/80 backdrop-blur-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <button onClick={() => { setLanguage('English'); setLangDropdownOpen(false); }} className="text-slate-700 block w-full text-left px-4 py-2 text-sm hover:bg-slate-200/50">English</button>
                    <button onClick={() => { setLanguage('हिंदी'); setLangDropdownOpen(false); }} className="text-slate-700 block w-full text-left px-4 py-2 text-sm hover:bg-slate-200/50">हिंदी</button>
                    <button onClick={() => { setLanguage('मराठी'); setLangDropdownOpen(false); }} className="text-slate-700 block w-full text-left px-4 py-2 text-sm hover:bg-slate-200/50">मराठी</button>
                  </div>
                </div>
              )}
            </div>
            {user ? (
              <>
                <NotificationBell />
                {dashboardLink && <NavLink to={dashboardLink.path} className={navLinkClass}>{dashboardLink.name}</NavLink>}
                <button onClick={logout} className={navLinkClass({isActive: false})}>
                  {t.navLogout}
                </button>
              </>
            ) : (
              <NavLink to="/login" className="rounded-md bg-brand-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity">
                {t.navLogin}
              </NavLink>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden ${isMenuOpen ? 'block' : 'hidden'}`} role="dialog" aria-modal="true">
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setIsMenuOpen(false)} />
        <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-brand-bg px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10">
          <div className="flex items-center justify-between">
            <Link to="/" className="-m-1.5 p-1.5">
              <span className="text-2xl font-bold text-white">found<span className="text-brand-secondary">tastic</span></span>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-slate-300"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-slate-500/10">
              <div className="space-y-2 py-6">
                <NavLink to="/" onClick={() => setIsMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-200 hover:bg-white/10">{t.navHome}</NavLink>
                <NavLink to="/about" onClick={() => setIsMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-200 hover:bg-white/10">{t.navAbout}</NavLink>
                <NavLink to="/contact" onClick={() => setIsMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-200 hover:bg-white/10">{t.navContact}</NavLink>
                <NavLink to="/faq" onClick={() => setIsMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-200 hover:bg-white/10">{t.navFaq}</NavLink>
                {(!user || user.role === 'user') && (
                  <NavLink to="/report" onClick={() => setIsMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-200 hover:bg-white/10">{t.navReport}</NavLink>
                )}
                 {user && (
                    <NavLink to="/live-map" onClick={() => setIsMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-200 hover:bg-white/10">Live Map</NavLink>
                )}
                {user && user.role === 'user' && (
                    <NavLink to="/my-group" onClick={() => setIsMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-200 hover:bg-white/10">{t.navMyGroup}</NavLink>
                )}
              </div>
              <div className="py-6">
                {user ? (
                  <>
                   {dashboardLink && <NavLink to={dashboardLink.path} onClick={() => setIsMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-slate-200 hover:bg-white/10">{dashboardLink.name}</NavLink>}
                   <button onClick={() => { logout(); setIsMenuOpen(false); }} className="-mx-3 block w-full text-left rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-slate-200 hover:bg-white/10">
                      {t.navLogout}
                   </button>
                  </>
                ) : (
                  <NavLink
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-slate-200 hover:bg-white/10"
                  >
                    {t.navLogin}
                  </NavLink>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;