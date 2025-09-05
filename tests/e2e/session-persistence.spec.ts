import { test, expect } from '@playwright/test'

test.describe('Session Persistence', () => {
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  const testFullName = 'Test User'

  test.beforeEach(async ({ page }) => {
    // Clear any existing session data
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  })

  test('should persist session after browser tab closure and reopening', async ({ page, context }) => {
    // Step 1: Sign up and verify login
    await page.goto('/auth/signup')
    await page.fill('input[id="fullName"]', testFullName)
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.click('button[type="submit"]')
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard')
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible()
    
    // Verify user is logged in
    await expect(page.locator(`text=${testEmail}`)).toBeVisible()
    
    // Step 2: Close tab and create new one
    await page.close()
    const newPage = await context.newPage()
    
    // Step 3: Navigate to dashboard directly
    await newPage.goto('/dashboard')
    
    // Step 4: Verify user is still logged in
    await expect(newPage.locator('h1:has-text("Dashboard")')).toBeVisible()
    await expect(newPage.locator(`text=${testEmail}`)).toBeVisible()
    
    // Cleanup
    await newPage.close()
  })

  test('should persist session after page refresh', async ({ page }) => {
    // Step 1: Sign up and verify login
    await page.goto('/auth/signup')
    await page.fill('input[id="fullName"]', testFullName)
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.click('button[type="submit"]')
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard')
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible()
    
    // Step 2: Refresh the page
    await page.reload()
    
    // Step 3: Verify user is still logged in
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible()
    await expect(page.locator(`text=${testEmail}`)).toBeVisible()
  })

  test('should persist session when navigating between protected routes', async ({ page }) => {
    // Step 1: Sign up and verify login
    await page.goto('/auth/signup')
    await page.fill('input[id="fullName"]', testFullName)
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.click('button[type="submit"]')
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard')
    
    // Step 2: Navigate to transactions page
    await page.click('a[href="/transactions"]')
    await page.waitForURL('/transactions')
    await expect(page.locator('h1:has-text("Transactions")')).toBeVisible()
    
    // Step 3: Navigate to settings page
    await page.click('a[href="/settings"]')
    await page.waitForURL('/settings')
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible()
    
    // Step 4: Navigate back to dashboard
    await page.goto('/dashboard')
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible()
    await expect(page.locator(`text=${testEmail}`)).toBeVisible()
  })

  test('should redirect to login when accessing protected routes without session', async ({ page }) => {
    // Step 1: Try to access dashboard without login
    await page.goto('/dashboard')
    
    // Step 2: Should redirect to login
    await page.waitForURL('/auth/login')
    await expect(page.locator('h1:has-text("Budget Manager")')).toBeVisible()
    
    // Step 3: Try to access transactions without login
    await page.goto('/transactions')
    await page.waitForURL('/auth/login')
    
    // Step 4: Try to access settings without login
    await page.goto('/settings')
    await page.waitForURL('/auth/login')
  })

  test('should redirect to dashboard when accessing auth pages with active session', async ({ page }) => {
    // Step 1: Sign up and verify login
    await page.goto('/auth/signup')
    await page.fill('input[id="fullName"]', testFullName)
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.click('button[type="submit"]')
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard')
    
    // Step 2: Try to access login page
    await page.goto('/auth/login')
    await page.waitForURL('/dashboard')
    
    // Step 3: Try to access signup page
    await page.goto('/auth/signup')
    await page.waitForURL('/dashboard')
  })

  test('should properly clear session on logout', async ({ page }) => {
    // Step 1: Sign up and verify login
    await page.goto('/auth/signup')
    await page.fill('input[id="fullName"]', testFullName)
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.click('button[type="submit"]')
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard')
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible()
    
    // Step 2: Logout
    await page.click('button:has-text("Sign Out"), button:has-text("Logout")')
    
    // Step 3: Should redirect to landing page
    await page.waitForURL('/')
    await expect(page.locator('h1:has-text("Budget Manager")')).toBeVisible()
    
    // Step 4: Try to access dashboard - should redirect to login
    await page.goto('/dashboard')
    await page.waitForURL('/auth/login')
    
    // Step 5: Verify session data is cleared
    const sessionData = await page.evaluate(() => {
      return {
        localStorage: localStorage.getItem('budget-manager-auth-token'),
        sessionStorage: Object.keys(sessionStorage).length
      }
    })
    
    expect(sessionData.localStorage).toBeNull()
    expect(sessionData.sessionStorage).toBe(0)
  })

  test('should display session information in dashboard', async ({ page }) => {
    // Step 1: Sign up and verify login
    await page.goto('/auth/signup')
    await page.fill('input[id="fullName"]', testFullName)
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.click('button[type="submit"]')
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard')
    
    // Step 2: Verify session information is displayed
    await expect(page.locator('text=Session Information')).toBeVisible()
    await expect(page.locator(`text=User: ${testEmail}`)).toBeVisible()
    await expect(page.locator('text=Session expires in:')).toBeVisible()
    await expect(page.locator('text=Auto-refresh: Enabled')).toBeVisible()
    await expect(page.locator('text=Persistent storage: Active')).toBeVisible()
  })

  test('should allow manual session refresh', async ({ page }) => {
    // Step 1: Sign up and verify login
    await page.goto('/auth/signup')
    await page.fill('input[id="fullName"]', testFullName)
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.click('button[type="submit"]')
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard')
    
    // Step 2: Click refresh session button
    await page.click('button:has-text("Refresh")')
    
    // Step 3: Verify session is still active
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible()
    await expect(page.locator(`text=${testEmail}`)).toBeVisible()
  })

  test('should handle session storage correctly', async ({ page }) => {
    // Step 1: Sign up and verify login
    await page.goto('/auth/signup')
    await page.fill('input[id="fullName"]', testFullName)
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.click('button[type="submit"]')
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard')
    
    // Step 2: Check that session data is stored in localStorage
    const sessionData = await page.evaluate(() => {
      return localStorage.getItem('budget-manager-auth-token')
    })
    
    expect(sessionData).toBeTruthy()
    
    // Step 3: Verify session persists after page reload
    await page.reload()
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible()
    
    // Step 4: Verify session data is still present
    const sessionDataAfterReload = await page.evaluate(() => {
      return localStorage.getItem('budget-manager-auth-token')
    })
    
    expect(sessionDataAfterReload).toBeTruthy()
    expect(sessionDataAfterReload).toBe(sessionData)
  })
})
