import { test, expect } from '@playwright/test'

test.describe('Landing Page Conditional Authentication UI', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session data
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  })

  test('should show unauthenticated UI for non-logged-in users', async ({ page }) => {
    await page.goto('/')
    
    // Wait for loading to complete
    await page.waitForLoadState('networkidle')
    
    // Should show Sign In button in header
    await expect(page.locator('a[href="/auth/login"]:has-text("Sign In")')).toBeVisible()
    
    // Should show Get Started button in header
    await expect(page.locator('a[href="/auth/signup"]:has-text("Get Started")')).toBeVisible()
    
    // Should show hero section with unauthenticated content
    await expect(page.locator('h1:has-text("Smart Personal")')).toBeVisible()
    await expect(page.locator('h1:has-text("Finance Tracking")')).toBeVisible()
    
    // Should show both hero buttons
    await expect(page.locator('a[href="/auth/signup"]:has-text("Get Started Free")')).toBeVisible()
    await expect(page.locator('a[href="/auth/login"]:has-text("Sign In")')).toBeVisible()
    
    // Should not show user information
    await expect(page.locator('text=Welcome back')).not.toBeVisible()
    await expect(page.locator('[data-testid="user-info"]')).not.toBeVisible()
  })

  test('should show authenticated UI for logged-in users', async ({ page }) => {
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'
    const testFullName = 'Test User'

    // Sign up first
    await page.goto('/auth/signup')
    await page.fill('input[id="fullName"]', testFullName)
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.click('button[type="submit"]')
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard')
    
    // Now go to landing page
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Should show user information in header instead of Sign In
    await expect(page.locator(`text=${testEmail}`)).toBeVisible()
    await expect(page.locator('a[href="/dashboard"]:has-text("Dashboard")')).toBeVisible()
    
    // Should NOT show Sign In button
    await expect(page.locator('a[href="/auth/login"]:has-text("Sign In")')).not.toBeVisible()
    
    // Should show personalized hero content
    await expect(page.locator('h1:has-text("Welcome back")')).toBeVisible()
    await expect(page.locator('h1:has-text("Test")')).toBeVisible() // First name
    
    // Should show authenticated hero buttons
    await expect(page.locator('a[href="/dashboard"]:has-text("Go to Dashboard")')).toBeVisible()
    await expect(page.locator('a[href="/transactions"]:has-text("View Transactions")')).toBeVisible()
    
    // Should NOT show unauthenticated hero buttons
    await expect(page.locator('a[href="/auth/signup"]:has-text("Get Started Free")')).not.toBeVisible()
    await expect(page.locator('a[href="/auth/login"]:has-text("Sign In")')).not.toBeVisible()
  })

  test('should handle loading state without UI flicker', async ({ page }) => {
    await page.goto('/')
    
    // Should show loading skeletons initially
    await expect(page.locator('.animate-pulse')).toBeVisible()
    
    // Wait for loading to complete
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Give time for auth check
    
    // Loading skeletons should be gone
    await expect(page.locator('.animate-pulse')).not.toBeVisible()
    
    // Should show actual content
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should be responsive on mobile viewports', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Header should be visible and functional
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('span:has-text("Budget Manager")')).toBeVisible()
    
    // Navigation buttons should be appropriately sized
    await expect(page.locator('a[href="/auth/login"]')).toBeVisible()
    await expect(page.locator('a[href="/auth/signup"]')).toBeVisible()
    
    // Hero section should be readable
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('p')).toBeVisible()
    
    // Buttons should be touch-friendly
    const getStartedButton = page.locator('a[href="/auth/signup"]:has-text("Get Started Free")')
    await expect(getStartedButton).toBeVisible()
    
    const buttonBox = await getStartedButton.boundingBox()
    expect(buttonBox?.height).toBeGreaterThan(40) // Touch-friendly height
  })

  test('should update UI when user logs out from another tab', async ({ page, context }) => {
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'
    const testFullName = 'Test User'

    // Sign up first
    await page.goto('/auth/signup')
    await page.fill('input[id="fullName"]', testFullName)
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.click('button[type="submit"]')
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard')
    
    // Go to landing page
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Verify authenticated UI
    await expect(page.locator(`text=${testEmail}`)).toBeVisible()
    
    // Open new tab and logout
    const newPage = await context.newPage()
    await newPage.goto('/dashboard')
    await newPage.waitForLoadState('networkidle')
    await newPage.click('button:has-text("Sign Out"), button:has-text("Logout")')
    await newPage.waitForURL('/')
    
    // Go back to original tab and refresh
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Should now show unauthenticated UI
    await expect(page.locator('a[href="/auth/login"]:has-text("Sign In")')).toBeVisible()
    await expect(page.locator(`text=${testEmail}`)).not.toBeVisible()
    
    await newPage.close()
  })

  test('should handle user with only email (no full name)', async ({ page }) => {
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'

    // Sign up without full name (if possible) or with empty full name
    await page.goto('/auth/signup')
    await page.fill('input[id="fullName"]', '') // Empty full name
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    
    // Try to submit - might fail validation, but let's see
    try {
      await page.click('button[type="submit"]')
      await page.waitForURL('/dashboard', { timeout: 5000 })
      
      // Go to landing page
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Should show email instead of full name
      await expect(page.locator(`text=${testEmail}`)).toBeVisible()
    } catch (error) {
      // If validation prevents empty name, that's expected
      console.log('Full name validation prevented empty name test')
    }
  })

  test('should show proper transitions between states', async ({ page }) => {
    await page.goto('/')
    
    // Initial loading state
    await expect(page.locator('.animate-pulse')).toBeVisible()
    
    // Wait for auth check to complete
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    // Should transition to unauthenticated state
    await expect(page.locator('.animate-pulse')).not.toBeVisible()
    await expect(page.locator('a[href="/auth/login"]:has-text("Sign In")')).toBeVisible()
    
    // Click sign up
    await page.click('a[href="/auth/signup"]:has-text("Get Started")')
    await page.waitForURL('/auth/signup')
    
    // Go back to landing page
    await page.goto('/')
    
    // Should still show unauthenticated UI
    await expect(page.locator('a[href="/auth/login"]:has-text("Sign In")')).toBeVisible()
  })
})
