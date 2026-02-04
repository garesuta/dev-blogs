# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/), [SemVer](https://semver.org/)

## [Unreleased]

### Added
- **header**: Command bar redesign with skip-to-content link (WCAG 2.4.1)
- **header**: Pill-style theme toggle with radiogroup ARIA pattern
- **header**: GitHub icon in header actions bar
- **header**: Mobile hamburger toggle with aria-expanded/aria-controls
- **header**: HeaderLink component with icon prop and aria-current support
- **testing**: Header component tests (21 tests), UserMenu tests (14 tests), ThemeSwitch tests (6 tests)
- **composables**: useApiCall - generic loading/error/data pattern for API calls
- **composables**: useDebouncedRef - debounced ref values with configurable delay
- **composables**: useMessageTimeout - standardized auto-dismiss success/error messages
- **composables**: useBootstrapModal - Bootstrap modal lifecycle management with shallowRef
- **composables**: useFormValidation - Zod schema integration with touched-field pattern
- **testing**: 36 unit tests for all composables (100% passing)
- **theme**: Cyber tech dark/light theme with CSS custom properties
- **theme**: Theme switcher with localStorage persistence (best practice flow)
- **theme**: Theme toggle buttons in Header and Footer components
- **theme**: Bootstrap 5.3 color mode support (data-bs-theme attribute)
- **testing**: 99 theme-related tests (unit, component, integration)
- **docs**: Theme implementation logs and README-THEME.md documentation

### Changed
- **header**: Replaced Bootstrap navbar with custom single-bar layout
- **header**: Changed logo from `<h2>` to `<a>` (semantic fix)
- **header**: Removed top bar utility strip (GitHub link moved to main header)
- **components**: UserMenu pill-style trigger with extracted computed properties
- **cli**: Added Claude Code skills for Vue best practices, Pinia, Vue Router, Vue testing, and VueUse
- **components**: Updated BaseHead with inline theme script to prevent flash
- **components**: Redesigned index.astro and BlogPost.astro with cyber theme
- **config**: Added docs/mock_design/ to gitignore

### Fixed
- **header**: Theme toggle button not working (inline onclick couldn't access module-scoped function)
- **security**: Sanitize v-html content in AboutManager.vue with DOMPurify (XSS fix)
- **ssr**: Add window access guards in LoginForm and RegisterForm for SSR safety
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
