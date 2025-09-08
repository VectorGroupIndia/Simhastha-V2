import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { uiStrings } from '../translations';
import { Report } from '../pages/ProfilePage';

type Language = 'English' | 'हिंदी' | 'मराठी';
type UiStrings = typeof uiStrings.English;
type ReportStatus = Report['status'];

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: UiStrings;
    translateStatus: (status: ReportStatus) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        try {
            const savedLang = localStorage.getItem('foundtastic-language');
            return savedLang && ['English', 'हिंदी', 'मराठी'].includes(savedLang)
                ? (savedLang as Language)
                : 'English';
        } catch {
            return 'English';
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('foundtastic-language', language);
        } catch (error) {
            console.error("Could not save language to localStorage", error);
        }
    }, [language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };
    
    const t = uiStrings[language] as UiStrings;

    const translateStatus = (status: ReportStatus): string => {
        // Fallback to English status if translation is missing
        return t.status[status] || uiStrings.English.status[status];
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, translateStatus }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};