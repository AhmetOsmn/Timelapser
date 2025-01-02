import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      timelapse: {
        title: 'Create Timelapse Video',
        uploadPrompt: 'Please upload your photos:',
        addPhotos: 'Add Photos',
        createVideo: 'Create Video',
      },
    },
  },
  tr: {
    translation: {
      timelapse: {
        title: 'Timelapse Video Oluştur',
        uploadPrompt: 'Lütfen fotoğraflarınızı yükleyin:',
        addPhotos: 'Fotoğraf Ekle',
        createVideo: 'Video Oluştur',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.locale.split('-')[0],
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n; 