import { Appearance } from 'react-native';
import { create } from 'zustand';

interface TimelapseState {
  isDark: boolean;
  selectedImages: string[];
  toggleTheme: () => void;
  addImages: (images: string[]) => void;
  removeImage: (index: number) => void;
  clearImages: () => void;
}

const useStore = create<TimelapseState>((set) => ({
  isDark: Appearance.getColorScheme() === 'dark',
  selectedImages: [],
  
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
  
  addImages: (images) => 
    set((state) => ({ 
      selectedImages: [...state.selectedImages, ...images] 
    })),
  
  removeImage: (index) =>
    set((state) => ({
      selectedImages: state.selectedImages.filter((_, i) => i !== index)
    })),
    
  clearImages: () => set({ selectedImages: [] }),
}));

// Sistem teması değiştiğinde store'u güncelle
Appearance.addChangeListener(({ colorScheme }) => {
  useStore.setState({ isDark: colorScheme === 'dark' });
});

export default useStore; 