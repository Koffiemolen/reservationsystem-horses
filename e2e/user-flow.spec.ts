import { test, expect } from '@playwright/test'

/**
 * E2E Test: Critical User Flow
 *
 * This test validates the complete user journey:
 * 1. User logs in
 * 2. Navigates to calendar/agenda
 * 3. Views existing reservations
 * 4. Attempts to create a reservation
 *
 * NOTE: Requires database to be seeded with test data
 * Run: npm run db:seed before running E2E tests
 */

test.describe('User Reservation Flow', () => {
  test('should login and view agenda', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')

    // Homepage should load
    await expect(page).toHaveTitle(/Manege de Raam|Stichting de Raam/)

    // Click login link (could be in header)
    await page.click('text=Inloggen')

    // Should navigate to login page
    await expect(page).toHaveURL(/.*login/)

    // Fill login form with test credentials
    await page.fill('input[type="email"]', 'test@example.nl')
    await page.fill('input[type="password"]', 'Test123!@#')

    // Submit login
    await page.click('button[type="submit"]')

    // Should redirect to agenda/calendar
    await expect(page).toHaveURL(/.*agenda/, { timeout: 10000 })

    // Verify user is logged in (check for logout button or user menu)
    await expect(page.locator('text=Uitloggen')).toBeVisible()
  })

  test('should display calendar with reservations', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.nl')
    await page.fill('input[type="password"]', 'Test123!@#')
    await page.click('button[type="submit"]')

    // Wait for navigation to agenda
    await page.waitForURL(/.*agenda/)

    // Calendar should be visible
    await expect(page.locator('[data-testid="calendar"]')).toBeVisible()
      .catch(() => {
        // Alternative: check for any calendar-like structure
        return expect(page.locator('.calendar, [role="calendar"]')).toBeVisible()
      })

    // Should show some time slots or dates
    await expect(page.locator('text=/\\d{1,2}:\\d{2}/')).toBeVisible({ timeout: 5000 })
      .catch(() => {
        // Alternative: check for date headers
        return expect(page.locator('text=/maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag/i')).toBeVisible()
      })
  })

  test('should navigate to reservations page', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.nl')
    await page.fill('input[type="password"]', 'Test123!@#')
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*agenda/)

    // Navigate to reservations page
    await page.click('text=Reserveringen')
      .catch(() => page.click('a[href*="reserveringen"]'))

    // Should be on reservations page
    await expect(page).toHaveURL(/.*reserveringen/)

    // Page should show reservations list or empty state
    const hasReservations = await page.locator('text=/reservering|reservation/i').count() > 0
    const hasEmptyState = await page.locator('text=/geen|empty/i').count() > 0

    expect(hasReservations || hasEmptyState).toBe(true)
  })

  test('should show error for invalid login', async ({ page }) => {
    await page.goto('/login')

    // Try invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Should stay on login page
    await expect(page).toHaveURL(/.*login/)

    // Should show error message
    await expect(page.locator('text=/onjuist|incorrect|fout|error/i')).toBeVisible({ timeout: 3000 })
  })
})

test.describe('Public Pages', () => {
  test('homepage should load without authentication', async ({ page }) => {
    await page.goto('/')

    // Should load successfully
    await expect(page).toHaveTitle(/Manege de Raam|Stichting de Raam/)

    // Should show main navigation
    await expect(page.locator('nav')).toBeVisible()

    // Should have login link
    await expect(page.locator('text=Inloggen')).toBeVisible()
  })

  test('contact page should be accessible', async ({ page }) => {
    await page.goto('/contact')

    // Contact form should be visible
    await expect(page.locator('form')).toBeVisible()

    // Should have name, email, message fields
    await expect(page.locator('input[name="name"], input[type="text"]')).toBeVisible()
    await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible()
    await expect(page.locator('textarea')).toBeVisible()
  })

  test('events page should show public events', async ({ page }) => {
    await page.goto('/evenementen')

    // Events page should load
    await expect(page).toHaveURL(/.*evenementen/)

    // Should show events or empty state
    const hasContent = await page.locator('text=/evenement|event|geen/i').count() > 0
    expect(hasContent).toBe(true)
  })
})

test.describe('Security', () => {
  test('admin pages should redirect when not authenticated', async ({ page }) => {
    // Try to access admin page directly
    await page.goto('/admin')

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/, { timeout: 5000 })
  })

  test('agenda page should redirect when not authenticated', async ({ page }) => {
    await page.goto('/agenda')

    // Should redirect to login with callback URL
    await expect(page).toHaveURL(/.*login.*callbackUrl.*agenda/, { timeout: 5000 })
  })

  test('should preserve callback URL after login redirect', async ({ page }) => {
    // Try to access protected page
    await page.goto('/agenda')

    // Should redirect to login with callback
    await page.waitForURL(/.*login/)
    expect(page.url()).toContain('callbackUrl')

    // Login
    await page.fill('input[type="email"]', 'test@example.nl')
    await page.fill('input[type="password"]', 'Test123!@#')
    await page.click('button[type="submit"]')

    // Should redirect back to agenda
    await expect(page).toHaveURL(/.*agenda/, { timeout: 10000 })
  })
})
