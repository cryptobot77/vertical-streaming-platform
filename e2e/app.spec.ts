import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test('should load and display hero section', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=StreamVault')).toBeVisible()
    await expect(page.locator('text=The future of')).toBeVisible()
    await expect(page.locator('text=vertical content')).toBeVisible()
  })

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('nav >> text=Feed')).toBeVisible()
    await expect(page.locator('nav >> text=Discover')).toBeVisible()
  })

  test('should navigate to discover page', async ({ page }) => {
    await page.goto('/')
    await page.click('nav >> text=Discover')
    await expect(page).toHaveURL('/discover')
    await expect(page.locator('h1:text("Discover")')).toBeVisible()
  })

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Start Watching Free')
    await expect(page).toHaveURL('/signup')
  })
})

test.describe('Auth pages', () => {
  test('login page should render correctly', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('text=Welcome back')).toBeVisible()
    await expect(page.locator('text=Sign in to continue')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('signup page should render correctly', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.locator('text=Create your account')).toBeVisible()
    await expect(page.locator('#username')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
  })

  test('forgot password page should render correctly', async ({ page }) => {
    await page.goto('/forgot-password')
    await expect(page.locator('text=Reset your password')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('text=Send Reset Link')).toBeVisible()
  })

  test('login page should have forgot password link', async ({ page }) => {
    await page.goto('/login')
    await page.click('text=Forgot password?')
    await expect(page).toHaveURL('/forgot-password')
  })
})

test.describe('Discover page', () => {
  test('should load and display header', async ({ page }) => {
    await page.goto('/discover')
    await expect(page.locator('h1:text("Discover")')).toBeVisible()
  })

  test('should have search input', async ({ page }) => {
    await page.goto('/discover')
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible()
  })

  test('should have category filter buttons', async ({ page }) => {
    await page.goto('/discover')
    await expect(page.locator('text=All')).toBeVisible()
    await expect(page.locator('text=Flagship')).toBeVisible()
    await expect(page.locator('text=Regular')).toBeVisible()
  })
})

test.describe('Subscribe page', () => {
  test('should display pricing plans', async ({ page }) => {
    await page.goto('/subscribe')
    await expect(page.locator('text=Monthly')).toBeVisible()
    await expect(page.locator('text=Yearly')).toBeVisible()
    await expect(page.locator('text=$9.99')).toBeVisible()
    await expect(page.locator('text=$99.99')).toBeVisible()
  })

  test('should display FAQ section', async ({ page }) => {
    await page.goto('/subscribe')
    await expect(page.locator('text=Frequently asked questions')).toBeVisible()
  })

  test('should toggle FAQ items', async ({ page }) => {
    await page.goto('/subscribe')
    await page.click('text=Can I cancel anytime?')
    await expect(page.locator('text=You can cancel your subscription')).toBeVisible()
  })
})

test.describe('404 page', () => {
  test('should show 404 for non-existent routes', async ({ page }) => {
    await page.goto('/nonexistent-page')
    await expect(page.locator('text=Page not found')).toBeVisible()
    await expect(page.locator('text=Go Home')).toBeVisible()
  })
})
