# Swiss Tourism Map - Claude Code Configuration

## Project Overview
Interactive map application showcasing Swiss tourist attractions, resorts, and products with multilingual support (DE/EN/FR/IT/HI/ZH).

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Testing**: Vitest, Playwright
- **Styling**: CSS/Tailwind
- **Internationalization**: i18n with 6 languages
- **Map**: Leaflet-based map visualization

## Project Structure
```
src/
├── components/        # React components
│   ├── Map/          # Map-related components
│   ├── Products/     # Product listings
│   ├── Resorts/      # Resort information
│   └── Sights/       # Tourist attractions
├── api/              # API integration
├── types/            # TypeScript type definitions
├── utils/            # Helper utilities
└── i18n/             # Internationalization setup
```

## Key Guidelines

### Code Quality
- Use TypeScript for all new code
- Maintain existing test coverage with Vitest
- Follow ESLint and Prettier configurations
- Add E2E tests with Playwright for user-facing features

### Internationalization
- All user-facing text must support the 6 supported languages
- Use i18n keys consistently
- Update all language files when adding new strings

### Components
- Use functional components with hooks
- Keep components focused and reusable
- Props should be typed with interfaces from `src/types/`

### Commits
- Use clear, descriptive commit messages
- Reference issue numbers when applicable (e.g., "fix: issue #35")
- Format: `type: description` (feat, fix, refactor, test, docs, style)

## Running Locally
```bash
npm install
npm run dev      # Development server
npm run build    # Production build
npm run test     # Run tests
npm run test:e2e # Run E2E tests
```

## Before Pushing
- All tests must pass
- No uncommitted changes (unless intentional)
- Confirm before force-pushing to main
