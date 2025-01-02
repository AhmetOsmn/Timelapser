import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsMoonStars, BsSun } from 'react-icons/bs';
import { IoLanguage } from 'react-icons/io5';
import PhotoUpload from "./components/PhotoUpload";
import './i18n';
import useStore from './store/useStore';

function App() {
    const { darkMode, toggleDarkMode, language, toggleLanguage } = useStore();
    const { t } = useTranslation();
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const langMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
                setIsLangMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`App min-h-screen p-4 relative ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
            <div className="absolute top-4 right-4 flex gap-2">
                <div className="relative" ref={langMenuRef}>
                    <button 
                        onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                            darkMode 
                                ? 'bg-gray-800 hover:bg-gray-700' 
                                : 'bg-white hover:bg-gray-100'
                        } shadow-sm transition duration-200 border ${
                            darkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}
                        aria-label={t('language')}
                    >
                        <IoLanguage size={20} />
                        <span className="font-medium">{language.toUpperCase()}</span>
                    </button>

                    {isLangMenuOpen && (
                        <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${
                            darkMode ? 'bg-gray-800' : 'bg-white'
                        } border ${
                            darkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                            <div className="py-1">
                                <button
                                    onClick={() => {
                                        if (language !== 'tr') toggleLanguage();
                                        setIsLangMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm ${
                                        language === 'tr' 
                                            ? (darkMode ? 'bg-gray-700' : 'bg-gray-100') 
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    🇹🇷 Türkçe
                                </button>
                                <button
                                    onClick={() => {
                                        if (language !== 'en') toggleLanguage();
                                        setIsLangMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm ${
                                        language === 'en' 
                                            ? (darkMode ? 'bg-gray-700' : 'bg-gray-100') 
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    🇬🇧 English
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    onClick={toggleDarkMode} 
                    className={`p-2 rounded-lg ${
                        darkMode 
                            ? 'bg-gray-800 hover:bg-gray-700' 
                            : 'bg-white hover:bg-gray-100'
                    } shadow-sm transition duration-200 border ${
                        darkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}
                    aria-label={darkMode ? t('lightMode') : t('darkMode')}
                >
                    {darkMode ? <BsSun size={20} /> : <BsMoonStars size={20} />}
                </button>
            </div>
            
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-4xl font-bold mb-6 text-center">{t('title')}</h1>
                <p className="text-lg mb-4">{t('uploadText')}</p>
                <PhotoUpload />
            </div>
        </div>
    );
}

export default App;
