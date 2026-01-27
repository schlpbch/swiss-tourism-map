import React, { useState } from 'react';
import { useLanguageStore } from '../store/languageStore';
import { t, languageNames, supportedLangs } from '../i18n';
import type { Lang } from '../i18n';

interface SbbHeaderProps {
  onLanguageChange?: (lang: string) => void;
}

const navItems = [
  { href: '/', key: 'nav.map', icon: '🗺️' },
  { href: '/sights', key: 'nav.sights', icon: '🏔️' },
  { href: '/resorts', key: 'nav.resorts', icon: '⛷️' },
  { href: '/products', key: 'nav.products', icon: '🎫' },
];

export default function SbbHeader({ onLanguageChange }: SbbHeaderProps) {
  const { language, setLanguage } = useLanguageStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = event.target.value as Lang;
    setLanguage(newLang);
    onLanguageChange?.(newLang);
  };

  const title = t(language, 'title');

  return (
    <header
      className="w-full border-b"
      style={{
        backgroundColor: 'var(--sbb-color-white)',
        borderColor: 'var(--sbb-color-cloud)',
      }}
    >
      <div className="px-4 md:px-8 py-3 flex items-center justify-between">
        {/* Left: Logo and Title */}
        <a
          href="/"
          className="flex items-center gap-3 no-underline group"
          aria-label="Homepage"
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all"
            style={{
              backgroundColor: 'var(--sbb-color-milk)',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 60 24"
              fill="var(--sbb-color-red)"
              aria-hidden="true"
            >
              <path
                d="M5.5 5h7.3c2.8 0 4.7 1.1 4.7 3.4 0 1.4-.8 2.4-2.1 2.9v.1c1.7.4 2.7 1.6 2.7 3.2 0 2.6-2.2 4.1-5.2 4.1H5.5V5zm4.2 5.2h2.1c1.3 0 2-.5 2-1.5s-.7-1.4-2-1.4H9.7v2.9zm0 5.5h2.5c1.4 0 2.2-.6 2.2-1.7 0-1.1-.8-1.6-2.2-1.6H9.7v3.3zM20.2 5h7.3c2.8 0 4.7 1.1 4.7 3.4 0 1.4-.8 2.4-2.1 2.9v.1c1.7.4 2.7 1.6 2.7 3.2 0 2.6-2.2 4.1-5.2 4.1h-7.4V5zm4.2 5.2h2.1c1.3 0 2-.5 2-1.5s-.7-1.4-2-1.4h-2.1v2.9zm0 5.5h2.5c1.4 0 2.2-.6 2.2-1.7 0-1.1-.8-1.6-2.2-1.6h-2.5v3.3z"
              />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1
              className="text-base md:text-lg font-bold leading-tight"
              style={{ color: 'var(--sbb-color-charcoal)' }}
            >
              {title}
            </h1>
            <p
              className="text-xs md:text-sm hidden sm:block"
              style={{ color: 'var(--sbb-color-granite)' }}
            >
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
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                style={{
                  backgroundColor: isActive ? 'var(--sbb-color-milk)' : 'transparent',
                  color: isActive ? 'var(--sbb-color-red)' : 'var(--sbb-color-charcoal)',
                  borderBottom: isActive ? '3px solid var(--sbb-color-red)' : 'none',
                  paddingBottom: isActive ? 'calc(0.5rem - 3px)' : '0.5rem',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--sbb-color-cloud)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span>{item.icon}</span>
                {t(language, item.key)}
              </a>
            );
          })}
        </nav>

        {/* Right: Language Selector and Mobile Menu */}
        <div className="flex items-center gap-2 md:gap-3">
          <select
            value={language}
            onChange={handleLanguageChange}
            aria-label="Language selection"
            className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: 'var(--sbb-color-milk)',
              color: 'var(--sbb-color-charcoal)',
              border: '1px solid var(--sbb-color-cloud)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--sbb-color-cloud)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--sbb-color-milk)';
            }}
          >
            {supportedLangs.map((lang) => (
              <option
                key={lang}
                value={lang}
                style={{
                  color: 'var(--sbb-color-charcoal)',
                  backgroundColor: 'white',
                }}
              >
                {languageNames[lang]}
              </option>
            ))}
          </select>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-all"
            style={{
              backgroundColor: mobileMenuOpen ? 'var(--sbb-color-milk)' : 'transparent',
              color: 'var(--sbb-color-charcoal)',
            }}
            aria-label="Toggle menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t px-4 py-3 space-y-2"
          style={{
            backgroundColor: 'var(--sbb-color-milk)',
            borderColor: 'var(--sbb-color-cloud)',
          }}
        >
          {navItems.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: isActive ? 'var(--sbb-color-cloud)' : 'transparent',
                  color: isActive ? 'var(--sbb-color-red)' : 'var(--sbb-color-charcoal)',
                }}
              >
                <span>{item.icon}</span>
                {t(language, item.key)}
              </a>
            );
          })}
        </div>
      )}
    </header>
  );
}
