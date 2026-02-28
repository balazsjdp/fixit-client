import { test, expect } from '@playwright/test'

test.describe('My Reports Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/client/my-reports')
    await page.waitForLoadState('networkidle')
  })

  test('displays the page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /bejelentett hibáim/i })).toBeVisible()
  })

  test('shows subtitle text', async ({ page }) => {
    await expect(page.getByText(/kövesse nyomon/i)).toBeVisible()
  })

  test('"new report" button links to /client/new', async ({ page }) => {
    const newLink = page.getByRole('link', { name: /új hiba bejelentése/i })
    await expect(newLink).toBeVisible()
    await expect(newLink).toHaveAttribute('href', '/client/new')
  })

  test('clicking "new report" navigates to the form', async ({ page }) => {
    await page.getByRole('link', { name: /új hiba bejelentése/i }).click()
    await page.waitForURL(/\/client\/new/, { timeout: 10_000 })
    await expect(page.getByRole('heading', { name: /hiba bejelentése/i })).toBeVisible()
  })

  test('shows at least one report card', async ({ page }) => {
    // The page currently has hardcoded mock data
    await expect(page.getByText(/csöpögő csap/i)).toBeVisible()
  })

  test('report card has a "Részletek" link', async ({ page }) => {
    const detailsLink = page.getByRole('link', { name: /részletek/i })
    await expect(detailsLink).toBeVisible()
  })
})
