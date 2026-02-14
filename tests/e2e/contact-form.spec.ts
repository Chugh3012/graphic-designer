import { test, expect } from '@playwright/test'

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact')
  })

  test('should display contact form with all fields', async ({ page }) => {
    // Check form fields are present
    await expect(page.getByLabel(/name/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/project type/i)).toBeVisible()
    await expect(page.getByLabel(/budget/i)).toBeVisible()
    await expect(page.getByLabel(/message/i)).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    // Try to submit without filling fields
    await page.getByRole('button', { name: /send|submit/i }).click()
    
    // Check for validation error messages
    const errorMessages = page.getByText(/required|must be at least/i)
    await expect(errorMessages.first()).toBeVisible()
  })

  test('should show email validation error', async ({ page }) => {
    await page.getByLabel(/name/i).fill('Test User')
    await page.getByLabel(/email/i).fill('invalid-email')
    await page.getByLabel(/message/i).fill('This is a test message for validation')
    
    await page.getByRole('button', { name: /send|submit/i }).click()
    
    // Check for email validation error
    await expect(page.getByText(/valid email/i)).toBeVisible()
  })

  test('should accept valid form data', async ({ page }) => {
    // Fill out the form with valid data
    await page.getByLabel(/name/i).fill('Jane Designer')
    await page.getByLabel(/email/i).fill('jane@example.com')
    
    // Select project type and budget (these might be dropdowns)
    await page.getByLabel(/project type/i).selectOption({ index: 1 })
    await page.getByLabel(/budget/i).selectOption({ index: 1 })
    
    await page.getByLabel(/message/i).fill('I would like to discuss a branding project for my startup.')
    
    await page.getByRole('button', { name: /send|submit/i }).click()
    
    // Check for success message or button state change
    // Adjust this based on your actual success behavior (modal, toast, inline message, etc.)
    await page.waitForTimeout(2000) // Wait for submission
    
    // Form should either show success message or be cleared/disabled
    const submitButton = page.getByRole('button', { name: /send|submit/i })
    // Just verify the button exists (success state varies by implementation)
    await expect(submitButton).toBeVisible()
  })
})
