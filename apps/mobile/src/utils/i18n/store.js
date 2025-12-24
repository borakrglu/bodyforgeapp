import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translations } from "./translations/index";

export const useLanguageStore = create((set, get) => ({
  language: "en",
  setLanguage: async (lang) => {
    await AsyncStorage.setItem("language", lang);
    set({ language: lang });
  },
  loadLanguage: async () => {
    const saved = await AsyncStorage.getItem("language");
    if (saved) {
      set({ language: saved });
    } else {
      set({ language: "en" });
    }
  },
  t: (key) => {
    const { language } = get();
    return translations[language]?.[key] || translations.en[key] || key;
  },
}));
