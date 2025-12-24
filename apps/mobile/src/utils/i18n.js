import { useLanguageStore } from "./i18n/store";

export const useLanguage = () => {
  const { language, setLanguage, loadLanguage, t } = useLanguageStore();

  return {
    language,
    setLanguage,
    loadLanguage,
    t,
  };
};

export default useLanguage;
