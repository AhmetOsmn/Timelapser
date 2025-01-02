import { create } from 'zustand';
import i18n from '../i18n';

interface AppState {
    darkMode: boolean;
    toggleDarkMode: () => void;
    language: string;
    toggleLanguage: () => void;
}

const useStore = create<AppState>((set) => ({
    darkMode: false,
    toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    language: 'tr',
    toggleLanguage: () => set((state) => {
        const newLang = state.language === 'tr' ? 'en' : 'tr';
        i18n.changeLanguage(newLang);
        return { language: newLang };
    }),
}));

export default useStore; 