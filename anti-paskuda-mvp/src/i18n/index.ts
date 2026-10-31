import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ru from './locales/ru.json';

i18n.use(initReactI18next).init({
  resources: {
    ru: {
      translation: ru,
    },
  },

  lng: 'ru',
  fallbackLng: 'ru',
  supportedLngs: ['ru'],

  interpolation: {
    escapeValue: false, // React escapes rendered text already
  },

  debug: import.meta.env.DEV,
});

export default i18n;
