# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/), [SemVer](https://semver.org/)

## [Unreleased]

### Added
- **testing**: Comprehensive test suite using Vitest with 130 passing tests
- **testing**: Unit tests for validation schemas, permissions, and content processing
- **testing**: Vue component tests with @vue/test-utils
- **testing**: Integration tests for middleware and API endpoints
- **testing**: Test documentation (TESTING.md, TEST_SUMMARY.md, CODE_REVIEW.md)
- **testing**: Vitest configuration with TypeScript support and coverage reporting

### Changed
- **config**: Updated tsconfig.json with path aliases (@/*) and vitest types
- **config**: Added test scripts to package.json (test, test:ui, test:run, test:coverage)
- **deps**: Added vitest, @vue/test-utils, @testing-library/vue, happy-dom
- **deps**: Added @vitest/ui and @vitest/coverage-v8 for test tooling
- **docs**: Updated CLAUDE.md with testing section and documentation
- **cli**: Added Claude Code skills for testing automation, UX/UI review, and Gemini CLI
- **cli**: Added git-commit and git-push commands for version control workflows
- **cli**: Updated plan-feature command with improved discovery phase
- **cli**: Added execute-plan-tdd command for test-driven implementation
