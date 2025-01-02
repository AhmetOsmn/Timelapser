import { create } from 'zustand';
import i18n from '../i18n';

interface AppState {
    darkMode: boolean;
    toggleDarkMode: () => void;
    language: string;
    toggleLanguage: () => void;
    videoUrl: string | null;
    setVideoUrl: (url: string | null) => void;
    isProcessing: boolean;
    setIsProcessing: (status: boolean) => void;
}

const useStore = create<AppState>((set) => ({
    darkMode: true,
    toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    language: 'tr',
    toggleLanguage: () => set((state) => {
        const newLang = state.language === 'tr' ? 'en' : 'tr';
        i18n.changeLanguage(newLang);
        return { language: newLang };
    }),
    videoUrl: null,
    setVideoUrl: (url) => set({ videoUrl: url }),
    isProcessing: false,
    setIsProcessing: (status) => set({ isProcessing: status }),
}));

export default useStore; 