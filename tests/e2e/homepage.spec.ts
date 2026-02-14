import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check that the page title is present
    await expect(page).toHaveTitle(/Portfolio|Designer/i)
  })

  test('should display featured work section', async ({ page }) => {
    await page.goto('/')
    
    // Look for featured work heading or section
    const featuredSection = page.getByRole('heading', { name: /featured|work|projects/i })
    await expect(featuredSection).toBeVisible()
  })

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/')
    
    // Check that About link exists and is clickable in the navigation
    const aboutLink = page.getByRole('navigation').getByRole('link', { name: /about/i })
    await expect(aboutLink).toBeVisible()
    
    // Check that Contact link exists
    const contactLink = page.getByRole('navigation').getByRole('link', { name: /contact/i })
    await expect(contactLink).toBeVisible()
  })
})
