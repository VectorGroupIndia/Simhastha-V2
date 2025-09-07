import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const allLanguages: { code: 'English' | 'हिंदी' | string, name: string }[] = [
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

  const handleLanguageClick = (e: React.MouseEvent<HTMLButtonElement>, langCode: string) => {
    e.preventDefault();
    if (langCode === 'English' || langCode === 'हिंदी' || langCode === 'मराठी') {
      setLanguage(langCode);
    } else {
      alert(`${langCode} support is coming soon!`);
    }
  };

  return (
    <div className="relative isolate overflow-hidden min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-6 lg:px-8 text-white">
      {/* Animated Background Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-primary/30 rounded-full filter blur-3xl opacity-50 animate-float"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-secondary/30 rounded-full filter blur-3xl opacity-50 animate-float2"></div>
      <div className="absolute top-1/2 -right-20 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl opacity-40 animate-float"></div>


      <div className="mx-auto max-w-4xl text-center z-10">
        <div className="bg-white/10 backdrop-blur-lg p-8 sm:p-12 rounded-2xl border border-white/20 shadow-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {t.homeWelcome} <span className="text-brand-secondary">foundtastic</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            {t.homeTagline}
          </p>
          <p className="mt-2 text-2xl font-bold text-white">
            {t.homeEvent}
          </p>
          <div className="mt-10">
              <Link to="/report" className="group relative inline-block rounded-md bg-brand-secondary px-8 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-brand-secondary/50 transition-all duration-300 transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary">
                <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></span>
                {t.homeButton}
              </Link>
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
                  : 'bg-white/10 border-white/20 text-slate-300 hover:bg-white/20 hover:text-white'
              } backdrop-blur-sm`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;