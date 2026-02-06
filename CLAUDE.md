# Swiss Tourism Map - Claude Code Configuration

## Project Overview

Interactive map application showcasing Swiss tourist attractions, resorts, and products with multilingual support (DE/EN/FR/IT/HI/ZH).

## Tech Stack

- **Frontend**: Astro 5.x with React Islands, TypeScript
- **Testing**: Vitest (Unit), Playwright (E2E)
- **Styling**: Tailwind CSS v4
- **Code Quality**: ESLint, Prettier
- **Internationalization**: i18n with 6 languages
- **Map**: Leaflet-based map visualization with clustering

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
pnpm install
pnpm run dev      # Development server
pnpm run build    # Production build
pnpm run test     # Run all tests
pnpm run test:unit # Run unit tests
pnpm run test:e2e # Run E2E tests
pnpm run lint     # Lint code
pnpm run format   # Format code
```

## Before Pushing

- Run `pnpm run lint` and fix any issues
- Run `pnpm run format` to format code
- All tests must pass (`pnpm test`)
- No uncommitted changes (unless intentional)
- Confirm before force-pushing to main
