import { useEffect } from 'react';
import { useLanguageStore } from '../store/languageStore';
import { t } from '../i18n';

interface LanguageSyncProps {
  /** Translation key for the page title */
  titleKey?: string;
  /** Optional suffix for the title (e.g., " | Company Name") */
  titleSuffix?: string;
}

/**
 * Component that syncs page title and HTML lang attribute with current language
 * Should be included once per page to make it reactive to language changes
 */
export default function LanguageSync({ titleKey = 'title', titleSuffix }: LanguageSyncProps) {
  const { language } = useLanguageStore();

  useEffect(() => {
    // Update document title when language changes
    const translatedTitle = t(language, titleKey);
    const fullTitle = titleSuffix ? `${translatedTitle}${titleSuffix}` : translatedTitle;

    if (typeof document !== 'undefined') {
      document.title = fullTitle;
    }
  }, [language, titleKey, titleSuffix]);

  useEffect(() => {
    // Update HTML lang attribute when language changes
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  // This component doesn't render anything
  return null;
}
