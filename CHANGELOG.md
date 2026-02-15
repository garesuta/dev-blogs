# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/), [SemVer](https://semver.org/)

## [Unreleased]

### Added
- **homepage**: "What You'll Find Here" value pillar cards (Web Dev Deep Dives, Dev Career & Business, Lessons from Work, Full-Stack Craft)
- **homepage**: Staggered fade-slide-up entrance animations and hover effects for pillar cards with prefers-reduced-motion support
- **editor**: Add integration tests for TiptapEditor component and API endpoints (components, extensions, composables)

### Fixed
- **auth**: Google login button invisible on dark theme — replaced `btn-outline-dark` with theme-aware `.google-btn`
- **auth**: Login and register card containers using hardcoded white background — replaced with `.login-card` using CSS variables
- **editor**: Image upload XSS vulnerability — added client-side file validation (size/MIME whitelist) and postId enforcement
- **editor**: Link modal XSS vulnerability — added protocol whitelist (http/https/mailto/tel only, reject javascript:/data:)
- **editor**: Extension XSS vulnerabilities — added URI sanitization for Figure and TableOfContents extensions
- **editor**: CPU spikes from mouse events — added RAF throttling (16ms) to handleEditorMouseMove
- **editor**: Layout thrashing — batched getBoundingClientRect calls within RAF frame
- **editor**: Vite build errors — fixed Vue 3 defineEmits syntax and Tiptap import paths

### Changed
- **theme**: Replace 200+ hardcoded hex colors with CSS variables across all pages, layouts, and Vue components for full light/dark theme support
- **theme**: Add ~50 new CSS variables (surfaces, neutrals, status colors, form inputs, editor styles) with both dark and light theme values
- **header**: Consolidate two-button theme toggle into single icon-swapping button
- **header**: Remove redundant Home nav link (logo already links to `/`)
- **footer**: Fix unreadable text in light theme by replacing hardcoded white colors with theme variables
- **footer**: Remove Home link from footer navigation
- **skills**: Replace legacy skills (code-reviewer, token-formatter, ux-toolkit, uxui-tool) with 21 new skills covering error debugging, multi-agent patterns, code quality, performance engineering, brainstorming, and CLI integrations
- **commands**: Add plan-feature-cline and plan-feature-multi-agent command definitions
- **editor**: Refactored TiptapEditor.vue from 2,303 to ~270 lines — extracted to modular architecture with 4 extensions, 7 sub-components, and 7 composables
- **editor**: Added 31 passing tests for editor extensions, utilities, and composables with 100% security/performance coverage

### Removed
- Newsletter "Never Miss an Article" section from homepage
