import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateRiskCategory: (category?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
  translateRiskCategory: (category?: string) => category || '',
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('mastitis_lang');
    return saved === 'ta' || saved === 'hi' || saved === 'en' ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mastitis_lang', lang);
  };

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] || entry.en || key;
  };

  const translateRiskCategory = (category?: string): string => {
    if (!category) return '';
    const norm = category.toLowerCase().trim();
    if (norm.includes('high')) return t('highRisk');
    if (norm.includes('moderate')) return t('moderateRisk');
    if (norm.includes('low')) return t('lowRisk');
    if (norm.includes('no')) return t('noRisk');
    return category;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateRiskCategory }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
