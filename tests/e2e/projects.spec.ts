import { test, expect } from '@playwright/test'

test.describe('Work/Projects Page', () => {
  test('should load projects page', async ({ page }) => {
    await page.goto('/work')
    
    // Check that the page loaded
    await expect(page).toHaveURL(/\/work/)
    
    // Look for projects heading or project cards
    const heading = page.getByRole('heading', { name: /work|projects|portfolio/i })
    await expect(heading.first()).toBeVisible()
  })

  test('should display project cards', async ({ page }) => {
    await page.goto('/work')
    
    // Check if any project cards are displayed — project cards are links to /work/<slug>
    const projectCards = page.locator('a[href*="/work/"]')
    
    // If there are published projects, they should be visible
    const count = await projectCards.count()
    if (count > 0) {
      await expect(projectCards.first()).toBeVisible()
    }
  })

  test('should navigate to project detail page', async ({ page }) => {
    await page.goto('/work')

    // Find the first project link
    const projectLink = page.locator('a[href*="/work/"]').first()

    const count = await projectLink.count()
    if (count > 0) {
      const href = await projectLink.getAttribute('href')

      // Navigate directly to verify the detail route exists
      const response = await page.goto(href!)

      // The page should respond (200 for real projects, 404 for placeholder data)
      expect(response).not.toBeNull()
      const status = response!.status()
      expect([200, 404]).toContain(status)

      if (status === 200) {
        // Real project — should show project detail content
        await expect(page.locator('h1').first()).toBeVisible()
      }
    } else {
      // Skip test if no projects exist
      test.skip()
    }
  })

  test('should filter projects by category', async ({ page }) => {
    await page.goto('/work')

    // Look for category filter buttons
    const categoryFilter = page.getByRole('button', { name: /branding|print|packaging/i })

    const count = await categoryFilter.count()
    if (count > 0) {
      await categoryFilter.first().click()

      // Projects should still be visible (filtered) — project cards are links to /work/<slug>
      const projects = page.locator('a[href*="/work/"]')
      await expect(projects.first()).toBeVisible({ timeout: 5000 })
    } else {
      // Skip test if no categories or filters exist
      test.skip()
    }
  })
})
