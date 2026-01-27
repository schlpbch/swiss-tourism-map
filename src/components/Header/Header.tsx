/**
 * Header component with SBB Design styling
 * Uses SBB design tokens for colors and styling
 */
import React, { useState } from 'react';

interface HeaderProps {
  onLanguageChange?: (lang: string) => void;
}

const languages = [
  { value: 'de', label: 'DE' },
  { value: 'en', label: 'EN' },
  { value: 'fr', label: 'FR' },
  { value: 'it', label: 'IT' },
];

const navItems = [
  { href: '/', label: 'Karte', icon: '🗺️' },
  { href: '/products', label: 'Produkte', icon: '🎫' },
];

export default function Header({ onLanguageChange }: HeaderProps) {
  const [language, setLanguage] = useState('de');

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = event.target.value;
    setLanguage(newLang);
    onLanguageChange?.(newLang);
  };

  // Get current path for active state
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  return (
    <header
      className="px-4 md:px-6 py-3 shadow-sm flex items-center justify-between"
      style={{
        backgroundColor: 'var(--sbb-color-red)',
        color: 'var(--sbb-color-white)'
      }}
    >
      {/* Logo and Title */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* SBB Logo */}
        <a href="/" className="flex items-center" aria-label="Homepage">
          <svg
            width="60"
            height="24"
            viewBox="0 0 60 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M0 0h60v24H0V0z" fill="currentColor"/>
            <path
              d="M5.5 5h7.3c2.8 0 4.7 1.1 4.7 3.4 0 1.4-.8 2.4-2.1 2.9v.1c1.7.4 2.7 1.6 2.7 3.2 0 2.6-2.2 4.1-5.2 4.1H5.5V5zm4.2 5.2h2.1c1.3 0 2-.5 2-1.5s-.7-1.4-2-1.4H9.7v2.9zm0 5.5h2.5c1.4 0 2.2-.6 2.2-1.7 0-1.1-.8-1.6-2.2-1.6H9.7v3.3zM20.2 5h7.3c2.8 0 4.7 1.1 4.7 3.4 0 1.4-.8 2.4-2.1 2.9v.1c1.7.4 2.7 1.6 2.7 3.2 0 2.6-2.2 4.1-5.2 4.1h-7.4V5zm4.2 5.2h2.1c1.3 0 2-.5 2-1.5s-.7-1.4-2-1.4h-2.1v2.9zm0 5.5h2.5c1.4 0 2.2-.6 2.2-1.7 0-1.1-.8-1.6-2.2-1.6h-2.5v3.3z"
              fill="var(--sbb-color-red)"
            />
            <path
              d="M37.4 17.8c-1.5-.8-2.3-2.3-2.3-4.4V5h4.2v8.1c0 1.9.7 2.9 2.4 2.9 1.6 0 2.4-1 2.4-2.9V5h4.2v8.4c0 2.1-.8 3.6-2.3 4.4-1.1.6-2.5.9-4.3.9s-3.2-.3-4.3-.9zM49.5 5h4.2v8.4c0 1.1.1 1.8.4 2.3.4.7 1.1 1 2 1s1.6-.3 2-1c.3-.5.4-1.2.4-2.3V5h4.2v8.4c0 2.2-.4 3.7-1.3 4.7-1.1 1.3-2.9 1.9-5.3 1.9s-4.2-.6-5.3-1.9c-.9-1-1.3-2.5-1.3-4.7V5z"
              fill="var(--sbb-color-white)"
            />
          </svg>
        </a>

        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center md:gap-3">
          <h1 className="text-lg md:text-xl font-bold leading-tight">
            Schweizer Tourismus
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex items-center gap-1 md:gap-2">
        {navItems.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5"
              style={{
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                color: 'inherit',
              }}
            >
              <span className="hidden md:inline">{item.icon}</span>
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Language Selector */}
        <select
          value={language}
          onChange={handleLanguageChange}
          className="bg-transparent border border-white/30 rounded px-2 py-1 text-sm cursor-pointer hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          style={{ color: 'inherit' }}
          aria-label="Sprache wählen"
        >
          {languages.map((lang) => (
            <option
              key={lang.value}
              value={lang.value}
              style={{ color: 'var(--sbb-color-charcoal)', backgroundColor: 'white' }}
            >
              {lang.label}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
