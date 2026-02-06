import { useState, useEffect } from 'react';
import { useLanguageStore } from '../store/languageStore';
import { t, languageNames, supportedLangs } from '../i18n';
import type { Lang } from '../i18n';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';

interface SbbHeaderProps {
  onLanguageChange?: (lang: string) => void;
}

const navItems = [
  { href: '/', key: 'nav.map' },
  { href: '/sights', key: 'nav.sights' },
  { href: '/resorts', key: 'nav.resorts' },
  { href: '/products', key: 'nav.products' },
];

export default function SbbHeader({ onLanguageChange }: SbbHeaderProps) {
  const { language, setLanguage } = useLanguageStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang as Lang);
    onLanguageChange?.(newLang);
  };

  const title = t(language, 'title');

  return (
    <header className="w-full border-b bg-[var(--card)] border-[var(--border)]">
      <div className="px-4 md:px-8 py-3 flex items-center justify-between">
        {/* Left: Logo and Title */}
        <a
          href="/"
          className="flex items-center gap-3 no-underline group"
          aria-label="Homepage"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all bg-[var(--background)]">
            <svg
              width="24"
              height="24"
              viewBox="0 0 60 24"
              fill="var(--sbb-color-red)"
              aria-hidden="true"
            >
              <path d="M5.5 5h7.3c2.8 0 4.7 1.1 4.7 3.4 0 1.4-.8 2.4-2.1 2.9v.1c1.7.4 2.7 1.6 2.7 3.2 0 2.6-2.2 4.1-5.2 4.1H5.5V5zm4.2 5.2h2.1c1.3 0 2-.5 2-1.5s-.7-1.4-2-1.4H9.7v2.9zm0 5.5h2.5c1.4 0 2.2-.6 2.2-1.7 0-1.1-.8-1.6-2.2-1.6H9.7v3.3zM20.2 5h7.3c2.8 0 4.7 1.1 4.7 3.4 0 1.4-.8 2.4-2.1 2.9v.1c1.7.4 2.7 1.6 2.7 3.2 0 2.6-2.2 4.1-5.2 4.1h-7.4V5zm4.2 5.2h2.1c1.3 0 2-.5 2-1.5s-.7-1.4-2-1.4h-2.1v2.9zm0 5.5h2.5c1.4 0 2.2-.6 2.2-1.7 0-1.1-.8-1.6-2.2-1.6h-2.5v3.3z" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base md:text-lg font-bold leading-tight text-[var(--foreground)]">
              {title}
            </h1>
            <p className="text-xs md:text-sm hidden sm:block text-[var(--muted-foreground)]">
              {t(language, 'tagline')}
            </p>
          </div>
        </a>

        {/* Center: Navigation (Desktop only) */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center mx-8">
          {navItems.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[var(--background)] text-[var(--primary)] border-b-3 border-[var(--primary)]'
                    : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                )}
              >
                {t(language, item.key)}
              </a>
            );
          })}
        </nav>

        {/* Right: Language Selector and Mobile Menu */}
        <div className="flex items-center gap-2 md:gap-3">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger
              className="w-auto min-w-[80px] bg-[var(--background)] border-[var(--border)]"
              aria-label="Language selection"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {supportedLangs.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {languageNames[lang]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              'md:hidden',
              mobileMenuOpen && 'bg-[var(--background)]'
            )}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t px-4 py-3 space-y-2 bg-[var(--background)] border-[var(--border)]">
          {navItems.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-[var(--muted)] text-[var(--primary)]'
                    : 'text-[var(--foreground)]'
                )}
              >
                {t(language, item.key)}
              </a>
            );
          })}
        </div>
      )}
    </header>
  );
}
