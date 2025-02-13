import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
      className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
    >
      <span className={`text-sm font-medium ${language === 'en' ? 'text-gray-400' : 'text-gray-700'}`}>
        Eng
      </span>
      <span className="text-sm text-gray-400">/</span>
      <span className={`text-sm font-medium ${language === 'zh' ? 'text-gray-400' : 'text-gray-700'}`}>
        中
      </span>
    </button>
  );
}