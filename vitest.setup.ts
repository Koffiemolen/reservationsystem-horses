import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

// Mock environment variables
process.env.AUTH_SECRET = 'test-secret-key-for-vitest-testing'
process.env.DATABASE_URL = 'file:./test.db'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NODE_ENV = 'test'

// Disable CSRF and rate limiting in tests
process.env.DISABLE_CSRF = 'true'
process.env.DISABLE_RATE_LIMIT = 'true'
