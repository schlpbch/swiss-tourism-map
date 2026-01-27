import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Lang, getDefaultLang } from '../i18n';

interface LanguageState {
  language: Lang;
  setLanguage: (lang: Lang) => void;
}

/**
 * Zustand store for language state with localStorage persistence
 */
export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: getDefaultLang(),
      setLanguage: (lang: Lang) => {
        set({ language: lang });
        // Update document lang attribute when language changes
        if (typeof document !== 'undefined') {
          document.documentElement.lang = lang;
        }
      },
    }),
    {
      name: 'language-storage',
      onRehydrateStorage: () => (state) => {
        // After rehydration, check if URL param should override
        if (typeof window !== 'undefined' && state) {
          const urlParams = new URLSearchParams(window.location.search);
          const langParam = urlParams.get('lang') as Lang | null;
          if (langParam && ['de', 'en', 'fr', 'it', 'hi', 'zh'].includes(langParam)) {
            state.setLanguage(langParam);
          } else {
            // Ensure HTML lang attribute matches stored language
            document.documentElement.lang = state.language;
          }
        }
      },
    }
  )
);
