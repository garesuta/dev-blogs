import { beforeEach, vi } from 'vitest'
import { config } from '@vue/test-utils'

// Global test setup
config.global.stubs = {
  transition: false,
  'transition-group': false,
}

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.BETTER_AUTH_SECRET = 'test-secret-for-testing-only-32-chars'
process.env.BETTER_AUTH_URL = 'http://localhost:4321'
process.env.PUBLIC_BETTER_AUTH_URL = 'http://localhost:4321'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})
