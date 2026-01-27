/**
 * SbbFooter component - SBB Lyne Design System Footer
 * Professional footer with SBB branding, links, and company information
 */

interface SbbFooterProps {
  year?: number;
}

export default function SbbFooter({ year = new Date().getFullYear() }: SbbFooterProps) {
  return (
    <footer
      style={{
        backgroundColor: 'var(--sbb-color-charcoal)',
        color: 'var(--sbb-color-white)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3
              className="text-sm font-bold mb-4 uppercase tracking-wider"
              style={{ color: 'var(--sbb-color-red)' }}
            >
              SBB Tourismus
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--sbb-color-cloud)' }}
            >
              Entdecke die Schweiz mit modernem Design und zuverlässigem Service.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3
              className="text-sm font-bold mb-4 uppercase tracking-wider"
              style={{ color: 'var(--sbb-color-red)' }}
            >
              Navigation
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Karte' },
                { href: '/products', label: 'Produkte' },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: 'var(--sbb-color-cloud)' }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Product Categories */}
          <div>
            <h3
              className="text-sm font-bold mb-4 uppercase tracking-wider"
              style={{ color: 'var(--sbb-color-red)' }}
            >
              Produkte
            </h3>
            <ul className="space-y-2">
              {[
                { label: 'RailAway Angebote' },
                { label: 'Swiss Travel System' },
                { label: 'Ferienangebote' },
              ].map((item, i) => (
                <li key={i}>
                  <span
                    className="text-sm"
                    style={{ color: 'var(--sbb-color-cloud)' }}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3
              className="text-sm font-bold mb-4 uppercase tracking-wider"
              style={{ color: 'var(--sbb-color-red)' }}
            >
              Info
            </h3>
            <ul className="space-y-2">
              {[
                { label: 'Datenschutz', href: '#' },
                { label: 'Impressum', href: '#' },
                { label: 'Kontakt', href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: 'var(--sbb-color-cloud)' }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            borderTop: '1px solid var(--sbb-color-granite)',
            paddingTop: '2rem',
            marginTop: '2rem',
          }}
        >
          {/* Copyright and Legal Links */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p
              className="text-xs"
              style={{ color: 'var(--sbb-color-cloud)' }}
            >
              © {year} SBB CFF FFS. Alle Rechte vorbehalten. | Swiss Tourism Map powered by MCP
            </p>
            <div className="flex gap-4 flex-wrap">
              {[
                { label: 'AGB', href: '#' },
                { label: 'Sicherheit', href: '#' },
                { label: 'Cookies', href: '#' },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-xs transition-colors hover:text-white"
                  style={{ color: 'var(--sbb-color-cloud)' }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
