import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingIndicator from '../components/LoadingIndicator';

const WhatsAppIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
);

const SmsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

const PhoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
);

const allLanguages: { code: 'English' | 'हिंदी' | 'मराठी' | string, name: string }[] = [
  { code: 'English', name: 'English' },
  { code: 'हिंदी', name: 'हिंदी' },
  { code: 'मराठी', name: 'मराठी' },
  { code: 'বাংলা', name: 'বাংলা' },
  { code: 'ગુજરાતી', name: 'ગુજરાતી' },
  { code: 'ಕನ್ನಡ', name: 'ಕನ್ನಡ' },
  { code: 'മലയാളം', name: 'മലയാളം' },
  { code: 'ਪੰਜਾਬੀ', name: 'ਪੰਜਾਬੀ' },
  { code: 'தமிழ்', name: 'தமிழ்' },
  { code: 'తెలుగు', name: 'తెలుగు' },
  { code: 'اردو', name: 'اردو' },
];

const HomePage: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If a logged-in user lands on the homepage, redirect them to their dashboard.
    if (!loading && user) {
        const dashboardMap = {
            admin: '/admin',
            authority: '/authority',
            volunteer: '/volunteer',
            user: '/profile'
        };
        const redirectPath = dashboardMap[user.role] || '/profile';
        navigate(redirectPath, { replace: true });
    }
  }, [user, loading, navigate]);

  const handleLanguageClick = (e: React.MouseEvent<HTMLButtonElement>, langCode: string) => {
    e.preventDefault();
    if (langCode === 'English' || langCode === 'हिंदी' || langCode === 'मराठी') {
      setLanguage(langCode);
    } else {
      alert(`${langCode} support is coming soon!`);
    }
  };

  // Show a loading state while checking auth or redirecting.
  if (loading || user) {
    return (
        <div className="relative isolate overflow-hidden min-h-screen flex flex-col items-center justify-center text-white">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-primary/30 rounded-full filter blur-3xl opacity-50 animate-float"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-secondary/30 rounded-full filter blur-3xl opacity-50 animate-float2"></div>
            <div className="bg-white/10 backdrop-blur-lg p-8 sm:p-12 rounded-2xl border border-white/20 shadow-2xl">
              <LoadingIndicator message="Redirecting to your dashboard..." />
            </div>
        </div>
    );
  }


  return (
    <div className="relative isolate overflow-hidden min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-6 lg:px-8 text-white">
      {/* Animated Background Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-primary/30 rounded-full filter blur-3xl opacity-50 animate-float"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-secondary/30 rounded-full filter blur-3xl opacity-50 animate-float2"></div>
      <div className="absolute top-1/2 -right-20 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl opacity-40 animate-float"></div>


      <div className="mx-auto max-w-4xl text-center z-10">
        <div className="bg-white/10 backdrop-blur-lg p-8 sm:p-12 rounded-2xl border border-white/20 shadow-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl" style={{textShadow: '0 2px 10px rgba(0,0,0,0.3)'}}>
            {t.homeWelcome} <span className="text-brand-secondary">foundtastic</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            {t.homeTagline}
          </p>
          <p className="mt-2 text-2xl font-bold text-white">
            {t.homeEvent}
          </p>
          <div className="mt-10">
            {(!user || user.role === 'user') && (
              <Link to="/report" className="group relative inline-block rounded-md bg-brand-secondary px-8 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-[0_0_25px_rgba(234,88,12,0.7)] transition-all duration-300 transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary">
                <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></span>
                {t.homeButton}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="z-10 mt-16 text-center">
        <h2 className="text-xl font-semibold text-white mb-2">{t.homeChooseLang}</h2>
        <p className="text-slate-400 mb-8">{t.homeChooseLangHi}</p>
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-4 px-4">
          {allLanguages.map(lang => (
            <button
              key={lang.code}
              onClick={(e) => handleLanguageClick(e, lang.code)}
              className={`px-5 py-2.5 font-medium rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-sm sm:text-base border ${
                language === lang.code
                  ? 'bg-white/20 border-brand-secondary text-white ring-2 ring-brand-secondary'
                  : 'bg-white/10 border-white/20 text-slate-300 hover:bg-white/20 hover:text-white hover:border-brand-secondary/70'
              } backdrop-blur-sm`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="z-10 mt-12 w-full max-w-sm mx-auto">
          <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300/30"></div>
              </div>
              <div className="relative flex justify-center">
                  <span className="px-2 bg-brand-bg/80 text-sm text-gray-400 backdrop-blur-sm">OR</span>
              </div>
          </div>
          <div className="space-y-4">
            <a href="https://wa.me/+917276199099" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-white bg-green-500/80 hover:bg-green-600/80 transition-colors backdrop-blur-sm">
              <WhatsAppIcon className="mr-3 flex-shrink-0" />
              <div className="leading-tight text-left">
                <p className="font-medium text-base">Continue with WhatsApp</p>
                <p className="text-xs">व्हाट्सएप के साथ जारी रखें</p>
              </div>
            </a>
            <button disabled className="w-full flex items-center justify-center px-4 py-3 border border-slate-300/50 rounded-lg text-slate-200 bg-slate-100/10 cursor-not-allowed opacity-60">
              <SmsIcon className="mr-3 flex-shrink-0" />
              <div className="leading-tight text-left">
                <p className="font-medium text-base">Continue with SMS <span className="text-xs">(Coming Soon)</span></p>
                <p className="text-xs">एसएमएस के साथ जारी रखें <span className="text-xs">(जल्द आ रहा है)</span></p>
              </div>
            </button>
            <button disabled className="w-full flex items-center justify-center px-4 py-3 border border-slate-300/50 rounded-lg text-slate-200 bg-slate-100/10 cursor-not-allowed opacity-60">
              <PhoneIcon className="mr-3 flex-shrink-0" />
               <div className="leading-tight text-left">
                <p className="font-medium text-base">Continue with Call <span className="text-xs">(Coming Soon)</span></p>
                <p className="text-xs">कॉल के साथ जारी रखें <span className="text-xs">(जल्द आ रहा है)</span></p>
              </div>
            </button>
          </div>
        </div>

    </div>
  );
};

export default HomePage;
