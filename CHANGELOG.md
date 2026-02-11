# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/), [SemVer](https://semver.org/)

## [Unreleased]

### Changed
- **theme**: Replace 200+ hardcoded hex colors with CSS variables across all pages, layouts, and Vue components for full light/dark theme support
- **theme**: Add ~50 new CSS variables (surfaces, neutrals, status colors, form inputs, editor styles) with both dark and light theme values
- **header**: Consolidate two-button theme toggle into single icon-swapping button
- **header**: Remove redundant Home nav link (logo already links to `/`)
- **footer**: Fix unreadable text in light theme by replacing hardcoded white colors with theme variables
- **footer**: Remove Home link from footer navigation
- **skills**: Replace legacy skills (code-reviewer, token-formatter, ux-toolkit, uxui-tool) with 21 new skills covering error debugging, multi-agent patterns, code quality, performance engineering, brainstorming, and CLI integrations
- **commands**: Add plan-feature-cline and plan-feature-multi-agent command definitions

### Removed
- Newsletter "Never Miss an Article" section from homepage
