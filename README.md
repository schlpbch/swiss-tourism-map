# Schweizer Tourismus Karte

Eine interaktive Kartenanwendung zur Visualisierung von Schweizer Sehenswürdigkeiten, Resorts und Tourismusprodukten.

## Features

### MVP (Aktuell implementiert)

- ✅ **Interaktive Karte** mit Leaflet und OpenStreetMap
- ✅ **287 Sehenswürdigkeiten** mit blauen Markern
- ✅ **35 Resorts** mit braunen Markern
- ✅ **133 RailAway Produkte** mit grünen Markern
- ✅ **Popup-Informationen** beim Klick auf Marker
- ✅ **Responsive Design** mit Tailwind CSS
- ✅ **API-Integration** mit FastAPI Backend
- ✅ **TypeScript** für Type Safety

### Geplante Features

- 🔄 Sidebar mit Such- und Filterfunktion
- ✅ **Marker-Clustering** - vollständig implementiert
- 🔄 Produkte-Tab mit detaillierten Informationen
- ✅ **Mehrsprachigkeit (DE/EN/FR/IT/HI/ZH)** - vollständig implementiert
- 🔄 Details-Modal für vollständige Informationen
- 🔄 Mobile Optimierung

## Mehrsprachigkeit (i18n)

Die Anwendung unterstützt sechs Sprachen:

- 🇩🇪 **Deutsch (de)** - Standard
- 🇬🇧 **English (en)**
- 🇫🇷 **Français (fr)**
- 🇮🇹 **Italiano (it)**
- 🇮🇳 **हिन्दी (hi)** - mit Noto Sans Devanagari Font
- 🇨🇳 **中文 (zh)** - mit Noto Sans SC Font

### Sprachauswahl

Die Sprache kann auf drei Arten gesetzt werden (Priorität von oben nach unten):

1. **URL Query Parameter**: `?lang=fr`

   ```
   http://localhost:4321/?lang=fr
   http://localhost:4321/sights?lang=zh
   ```

2. **Language Selector**: Dropdown-Menü im Header
   - Auswahl wird in localStorage gespeichert
   - Bleibt über Browser-Sessions erhalten

3. **Browser-Sprache**: Automatische Erkennung
   - Verwendet `navigator.language`
   - Fallback auf Deutsch wenn Sprache nicht unterstützt

### Übersetzungen hinzufügen

1. **Neue Keys hinzufügen**: Bearbeite alle JSON-Dateien in `src/i18n/`:

   ```json
   // src/i18n/de.json
   {
     "title": "Schweizer Tourismus Karte",
     "nav": {
       "map": "Karte"
     }
   }
   ```

2. **Im Code verwenden**:

   ```tsx
   import { t, useLanguageStore } from '../i18n';

   function MyComponent() {
     const { language } = useLanguageStore();
     return <h1>{t(language, 'title')}</h1>;
   }
   ```

3. **Verschachtelte Keys**: Verwende Punkt-Notation

   ```tsx
   t(language, 'nav.map'); // "Karte", "Map", "Carte", etc.
   ```

### Technische Details

- **i18n System**: `src/i18n/index.ts`
- **State Management**: Zustand Store mit localStorage Persistence
- **Translations**: JSON-Dateien in `src/i18n/`
- **Fonts**:
  - Standard: SBB Web Font
  - Hindi: Noto Sans Devanagari (Google Fonts)
  - Chinesisch: Noto Sans SC (Google Fonts)
- **HTML lang Attribut**: Wird dynamisch gesetzt
- **Fallback**: English → Deutsch → Key selbst

## Technologie-Stack

- **Frontend Framework**: Astro 5.x mit React Islands
- **Mapping**: Leaflet + React-Leaflet + React-Leaflet-Cluster
- **Styling**: Tailwind CSS v4
- **API Client**: Native Fetch API
- **State Management**: Zustand (für i18n und Filter)
- **TypeScript**: Strict Mode
- **Testing**: Vitest (Unit) + Playwright (E2E)
- **Code Quality**: ESLint + Prettier

## Voraussetzungen

1. **Backend Server** muss laufen:

   ```bash
   cd c:\Users\schlp\code\swiss-tourism-mcp
   python src/swiss_tourism_mcp/api.py
   ```

   - Backend läuft auf: `http://localhost:8000`
   - API-Dokumentation: `http://localhost:8000/docs`

2. **Node.js und pnpm** installiert

## Installation

```bash
cd c:\Users\schlp\code\swiss-tourism-map
pnpm install
```

## Entwicklung

```bash
# Development Server starten (http://localhost:4321)
pnpm run dev

# Build für Produktion
pnpm run build

# Build-Vorschau
pnpm run preview
```

## Projektstruktur

```
swiss-tourism-map/
├── src/
│   ├── api/                 # API Client Layer
│   │   ├── client.ts        # Axios Instance
│   │   ├── sights.ts        # Sehenswürdigkeiten API
│   │   ├── resorts.ts       # Resorts API
│   │   └── railaway.ts      # RailAway API
│   ├── components/
│   │   ├── Header.astro     # Header mit Titel
│   │   └── Map/
│   │       └── MapContainer.tsx  # Hauptkarte (React Island)
│   ├── layouts/
│   │   └── BaseLayout.astro      # Basis-Layout
│   ├── pages/
│   │   └── index.astro           # Hauptseite
│   ├── styles/
│   │   └── global.css            # Globale Styles + Leaflet CSS
│   └── types/                    # TypeScript Definitionen
│       ├── common.ts
│       ├── sight.ts
│       ├── resort.ts
│       ├── railaway.ts
│       └── filters.ts
├── public/
│   └── icons/                    # Marker Icons (geplant)
├── .env                          # Umgebungsvariablen
├── astro.config.mjs              # Astro Konfiguration
├── tailwind.config.mjs           # Tailwind Konfiguration
└── package.json
```

## Datenquellen

Die Anwendung nutzt das Swiss Tourism MCP Backend:

- **Sights**: `/api/v1/sights/search` - 287 Sehenswürdigkeiten
  - 24 Kategorien (nature, museum, alpine, etc.)
  - 70 Tags (atmospheric descriptors)
  - Prominence Scoring (0-100)
  - Multilingual (DE/EN/FR/IT)

- **Resorts**: `/api/v1/resorts` - 35 Alpine Resorts
  - Höhenangaben
  - Saisoninformationen
  - Aktivitäten

- **RailAway**: `/api/v1/railaway/search` - 133 Kombi-Angebote
  - Bahn + Attraktion
  - Rabattinformationen
  - Kategorien (Animal'n'Rail, Culture'n'Rail, etc.)

## Marker-Farben

- 🔵 **Blau**: Sehenswürdigkeiten (287 Items)
- 🟤 **Braun**: Resorts (35 Items)
- 🟢 **Grün**: RailAway Produkte (133 Items mit Koordinaten)

## Bekannte Probleme

- ⚠️ Backend muss auf Port 8000 laufen
- ⚠️ CORS muss im Backend konfiguriert sein (bereits implementiert)

## Nächste Schritte

1. **Sidebar-Komponente** hinzufügen
   - Suchfeld mit Debouncing
   - Filter nach Kategorien, Tags, Regionen
   - Prominence-Slider

2. **Produkte-Tab** erstellen
   - RailAway Produktliste
   - Travel System Pässe
   - STC Holiday Packages

3. **Details-Modal** hinzufügen
   - Vollständige Sehenswürdigkeiten-Informationen
   - Bilder und Links
   - Besucherinformationen

4. **Performance Monitoring** hinzufügen
   - Web Vitals tracking
   - Custom metrics für Map-Performance

## Entwickler-Notizen

- Leaflet benötigt `client:only="react"` in Astro (kein SSR)
- API-Base-URL in `.env` konfiguriert
- Tailwind CSS 4.x mit `@import "tailwindcss"`
- TypeScript Strict Mode aktiviert

## Lizenz

Dieses Projekt ist Teil des Swiss Tourism MCP und verwendet dessen Daten.
