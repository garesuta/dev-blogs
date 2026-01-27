# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/), [SemVer](https://semver.org/)

## [Unreleased]

### Added
- **theme**: Cyber tech dark/light theme with CSS custom properties
- **theme**: Theme switcher with localStorage persistence (best practice flow)
- **theme**: Theme toggle buttons in Header and Footer components
- **theme**: Bootstrap 5.3 color mode support (data-bs-theme attribute)
- **testing**: 99 theme-related tests (unit, component, integration)
- **docs**: Theme implementation logs and README-THEME.md documentation

### Changed
- **components**: Updated BaseHead with inline theme script to prevent flash
- **components**: Redesigned index.astro and BlogPost.astro with cyber theme
- **config**: Added docs/mock_design/ to gitignore

### Fixed
- **theme**: localStorage only saves on user action (not page load)
- **tests**: Fixed accessibility attribute tests for theme toggle
- **tests**: Fixed touch target size test for jsdom compatibility

## [0.0.2] - 2026-01-26

### Added
- **testing**: Comprehensive test suite using Vitest with 130 passing tests
- **testing**: Unit tests for validation schemas, permissions, and content processing
- **testing**: Vue component tests with @vue/test-utils
- **testing**: Integration tests for middleware and API endpoints
- **testing**: Test documentation (TESTING.md, TEST_SUMMARY.md, CODE_REVIEW.md)
- **testing**: Vitest configuration with TypeScript support and coverage reporting
- **cli**: Claude Code skills for testing automation, UX/UI review, and Gemini CLI
- **cli**: git-commit and git-push commands for version control workflows
- **cli**: execute-plan-tdd command for test-driven implementation

### Changed
- **config**: Updated tsconfig.json with path aliases (@/*) and vitest types
- **config**: Added test scripts to package.json (test, test:ui, test:run, test:coverage)
- **deps**: Added vitest, @vue/test-utils, @testing-library/vue, happy-dom
- **deps**: Added @vitest/ui and @vitest/coverage-v8 for test tooling
- **deps**: Updated pnpm-lock.yaml with new testing dependencies
- **docs**: Updated CLAUDE.md with testing section and documentation
- **cli**: Updated plan-feature command with improved discovery phase
- **git**: Added local_scripts/ to .gitignore
