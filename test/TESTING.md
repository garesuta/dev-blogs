# Testing Guide

This document outlines the testing setup and conventions used in this project.

## Test Structure

```
test/
├── setup.ts                    # Global test configuration
├── unit/                       # Unit tests
│   ├── validations.test.ts     # Schema validation tests
│   ├── permissions.test.ts     # Permission system tests
│   └── content-processor.test.ts # Content processing tests
├── components/                 # Vue component tests
│   ├── RoleSelector.test.ts    # Role selector component
│   └── TagManager.test.ts      # Tag manager component
└── integration/                # Integration tests
    ├── middleware.test.ts      # Auth middleware tests
    └── api/
        └── posts.test.ts       # Posts API endpoint tests
```

## Running Tests

### Run all tests in watch mode
```bash
pnpm test
```

### Run tests once
```bash
pnpm test:run
```

### Run tests with UI
```bash
pnpm test:ui
```

### Run tests with coverage
```bash
pnpm test:coverage
```

## Test Files by Feature

### Authentication & Authorization

**File:** `test/integration/middleware.test.ts`

Tests for:
- Public route access
- Protected route redirects
- Session management
- Role-based access control (user, editor, admin)
- Banned user handling

### Permission System

**File:** `test/unit/permissions.test.ts`

Tests for:
- Role definitions (admin, editor, user)
- Permission helper functions
- Access control plugin
- Permission hierarchy

### Validation Schemas

**File:** `test/unit/validations.test.ts`

Tests for:
- Email validation
- Password validation
- Name validation
- Login form validation
- Registration form validation
- Slug generation and validation
- Post creation/update validation
- SEO field validation
- Image upload validation
- Utility functions (getFieldError, generateSlug)

### Content Processing

**File:** `test/unit/content-processor.test.ts`

Tests for:
- Heading ID generation
- Duplicate heading handling
- Heading extraction
- Special character handling
- Empty content handling

### Vue Components

**Files:** `test/components/*.test.ts`

Tests for:
- Component rendering
- User interactions
- Event emission
- Props handling
- Loading/error states

### API Endpoints

**Files:** `test/integration/api/*.test.ts`

Tests for:
- Authentication requirements
- Authorization checks
- Request validation
- Response formatting
- Error handling
- Pagination
- Filtering and sorting

## Writing New Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from '@/lib/myModule'

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction('input')
    expect(result).toBe('expected')
  })
})
```

### Component Test Example

```typescript
import { mount } from '@vue/test-utils'
import MyComponent from '@/components/MyComponent.vue'

describe('MyComponent', () => {
  it('should render correctly', () => {
    const wrapper = mount(MyComponent, {
      props: { title: 'Test' }
    })
    expect(wrapper.text()).toContain('Test')
  })
})
```

## Test Conventions

1. **Arrange, Act, Assert** - Structure tests clearly
2. **Descriptive names** - Test names should describe what is being tested
3. **One assertion per test** - Keep tests focused
4. **Mock external dependencies** - Use vi.mock() for modules and vi.fn() for functions
5. **Clean up** - Use beforeEach to reset mocks

## Coverage Goals

- Unit tests: 80%+ coverage
- Components: 70%+ coverage
- Critical paths: 90%+ coverage

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Main branch pushes
- Before deployment

## Debugging Tests

### Run specific test file
```bash
pnpm test path/to/test.ts
```

### Run tests matching pattern
```bash
pnpm test --grep "should render"
```

### Debug with browser
```bash
pnpm test:ui --inspect
```
