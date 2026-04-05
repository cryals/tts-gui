import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en";
import ru from "./locales/ru";
import uk from "./locales/uk";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en,
      ru,
      uk,
    },
    fallbackLng: "en",
    lng: "en",
    supportedLngs: ["en", "ru", "uk"],
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage"],
      caches: ["localStorage"],
      lookupLocalStorage: "ntts-language",
    },
  });

export default i18n;
