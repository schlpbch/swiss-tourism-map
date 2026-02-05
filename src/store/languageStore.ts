import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Lang, getDefaultLang } from '../i18n';

interface LanguageState {
  language: Lang;
  setLanguage: (lang: Lang) => void;
  isHydrated: boolean;
}

/**
 * Zustand store for language state with localStorage persistence
 * Special handling for Astro SSR + client hydration
 */
export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'de' as Lang, // Default on server, will be overwritten on client
      isHydrated: false,
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
      skipHydration: true, // Prevent automatic hydration, we'll do it manually
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

// Manual hydration function to be called on client mount
if (typeof window !== 'undefined') {
  // Get stored language from localStorage if available
  const stored = localStorage.getItem('language-storage');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.state?.language) {
        useLanguageStore.setState({
          language: parsed.state.language,
          isHydrated: true,
        });
        document.documentElement.lang = parsed.state.language;
      }
    } catch (e) {
      console.error('Failed to hydrate language store:', e);
      // Fall back to getDefaultLang
      const lang = getDefaultLang();
      useLanguageStore.setState({
        language: lang,
        isHydrated: true,
      });
      document.documentElement.lang = lang;
    }
  } else {
    // No stored language, use default
    const lang = getDefaultLang();
    useLanguageStore.setState({
      language: lang,
      isHydrated: true,
    });
    document.documentElement.lang = lang;
  }
}
