# Testing Guide: Horse Reservation System

This guide provides everything you need to know about testing in this project.

---

## 🚀 Quick Start

```bash
# Install dependencies (already done if you ran npm install)
npm install

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode (continuous testing)
npm run test:watch
```

---

## 📁 Test Structure

```
reservationsystem-horses/
├── src/
│   ├── services/
│   │   ├── reservation.service.ts
│   │   ├── reservation.service.test.ts ← Unit tests
│   │   ├── block.service.ts
│   │   └── block.service.test.ts        ← Unit tests
│   └── app/api/
│       ├── reservations/
│       │   ├── route.ts
│       │   └── route.test.ts            ← Integration tests
│       └── auth/register/
│           ├── route.ts
│           └── route.test.ts            ← Integration tests
├── e2e/
│   └── user-flow.spec.ts                ← E2E tests
├── vitest.config.ts                     ← Vitest configuration
├── vitest.setup.ts                      ← Test setup/mocks
└── playwright.config.ts                 ← E2E configuration
```

---

## 🧪 Test Types

### 1. Unit Tests (Service Layer)
**Location:** `src/services/*.test.ts`
**Purpose:** Test business logic in isolation
**Framework:** Vitest
**Run:** `npm run test:unit`

**Coverage:** 23 tests covering:
- Overlap detection algorithms
- Block conflict detection
- Reservation creation flows
- Audit logging
- Email notifications (mocked)

### 2. Integration Tests (API Routes)
**Location:** `src/app/api/**/*.test.ts`
**Purpose:** Test HTTP endpoints with mocked dependencies
**Framework:** Vitest
**Run:** `npm run test:integration`

**Coverage:** 16 tests covering:
- Authentication checks
- Input validation
- Error handling (TIME_BLOCKED, OVERLAP_EXISTS)
- Password hashing
- Email normalization

### 3. E2E Tests (Playwright)
**Location:** `e2e/*.spec.ts`
**Purpose:** Test complete user flows in a real browser
**Framework:** Playwright
**Run:** `npm run test:e2e`

**Prerequisites:**
```bash
# 1. Seed database with test data
npm run db:seed

# 2. Start dev server (in another terminal)
npm run dev

# 3. Run E2E tests
npm run test:e2e

# Or use UI mode for debugging
npm run test:e2e:ui
```

---

## 📊 Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all Vitest tests |
| `npm run test:unit` | Run service layer unit tests only |
| `npm run test:integration` | Run API route integration tests only |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Run E2E tests with interactive UI |
| `npm run test:e2e:report` | View last E2E test report |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:ui` | Open Vitest interactive UI |

---

## 📈 Coverage Reports

### Current Status
- **Overall:** 57.31% statement coverage
- **API Routes:** 82-85% (excellent)
- **Validators:** 76.92% (good)
- **Services:** 39.58% (needs improvement)

**Target:** 70% across all files

### Viewing Coverage
```bash
# Generate coverage report
npm run test:coverage

# Open HTML report in browser
start coverage/index.html # Windows
open coverage/index.html  # macOS
xdg-open coverage/index.html # Linux
```

---

## 🛠️ Writing Tests

### Unit Test Template
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { functionToTest } from './service'

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    model: {
      findMany: vi.fn(),
    },
  },
}))

describe('FunctionName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should do something specific', async () => {
    // Arrange
    vi.mocked(prisma.model.findMany).mockResolvedValue([])

    // Act
    const result = await functionToTest(params)

    // Assert
    expect(result).toEqual(expectedValue)
  })
})
```

### Integration Test Template
```typescript
import { describe, it, expect, vi } from 'vitest'
import { POST } from './route'

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/security', () => ({
  validateSecurityMiddleware: vi.fn().mockResolvedValue(null),
}))

describe('POST /api/endpoint', () => {
  it('should validate authentication', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })
})
```

---

## 🚨 Common Issues

### 1. "Cannot find module '@/lib/db'"
**Solution:** Ensure `vitest.config.ts` has path alias configured (already done)

### 2. "CSRF validation failed"
**Solution:** Security middleware is disabled in test setup via environment variables

### 3. E2E tests fail
**Solution:** Ensure dev server is running before E2E tests:
```bash
npm run dev  # Keep running in separate terminal
npm run test:e2e
```

### 4. Coverage report shows unexpected results
**Solution:** Run tests with coverage flag:
```bash
npm run test:coverage  # Not just 'npm test'
```

---

## 📋 Test Checklist

When adding new features, ensure:

- [ ] Unit tests for service layer functions
- [ ] Integration tests for API routes
- [ ] Input validation tests (invalid data scenarios)
- [ ] Authentication/authorization tests
- [ ] Error handling tests (expected failures)
- [ ] Edge case tests (boundary conditions)
- [ ] Happy path tests (successful flows)
- [ ] E2E tests for critical user journeys (optional)

---

## 🎯 Coverage Goals

| Component | Target | Current | Status |
|-----------|--------|---------|--------|
| API Routes | 80% | 82-85% | ✅ Met |
| Services | 70% | 39.58% | 🔴 Below |
| Validators | 70% | 76.92% | ✅ Met |
| Overall | 70% | 57.31% | 🔴 Below |

**Priority Areas for Improvement:**
1. `reservation.service.ts` - updateReservation, cancelReservation, getUserReservations
2. `block.service.ts` - updateBlock, deleteBlock
3. Missing service tests - user.service.ts, event.service.ts, audit.service.ts

---

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [TEST_REPORT.md](./TEST_REPORT.md) - Detailed test results

---

**Happy Testing! 🧪**
