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
  const { setLanguage, t } = useLanguage();

  const handleLanguageClick = (e: React.MouseEvent<HTMLAnchorElement>, langCode: string) => {
    e.preventDefault();
    if (langCode === 'English' || langCode === 'हिंदी' || langCode === 'मराठी') {
      setLanguage(langCode);
    } else {
      alert(`${langCode} support is coming soon!`);
    }
  };

  return (
    <div className="bg-white">
      <div className="relative overflow-hidden px-6 pt-14 lg:px-8">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="mx-auto max-w-4xl py-24 sm:py-32 lg:py-40">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-brand-dark sm:text-6xl">
              {t.homeWelcome} <span className="text-brand-primary">foundtastic</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              {t.homeTagline}
            </p>
            <p className="mt-2 text-2xl font-bold text-brand-secondary">
              {t.homeEvent}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link to="/report" className="rounded-md bg-brand-secondary px-8 py-3.5 text-lg font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary">
                  {t.homeButton}
                </Link>
            </div>
          </div>
        </div>
        
        <div className="text-center pb-20">
          <h2 className="text-xl font-semibold text-brand-dark mb-2">{t.homeChooseLang}</h2>
          <p className="text-slate-500 mb-8">{t.homeChooseLangHi}</p>
          <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-3 sm:gap-4 px-4">
            {allLanguages.map(lang => (
              <a 
                key={lang.code} 
                href="#" 
                onClick={(e) => handleLanguageClick(e, lang.code)}
                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg shadow-sm hover:bg-brand-light hover:border-brand-primary hover:text-brand-primary transition-all duration-300 transform hover:-translate-y-1 text-sm sm:text-base"
              >
                {lang.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
