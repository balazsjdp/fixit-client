import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('root page renders the app shell', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // The root page renders the sidebar – sidebar should be visible
    await expect(page.locator('text=FixIt').first()).toBeVisible()
    await expect(page.locator('text=Menü')).toBeVisible()
  })

  test('navigates to my-reports via sidebar link', async ({ page }) => {
    await page.goto('/client/new')
    await page.waitForLoadState('networkidle')

    const myReportsLink = page.getByRole('link', { name: /bejelentéseim/i })
    await expect(myReportsLink).toBeVisible()
    await myReportsLink.click()

    await page.waitForURL(/\/client\/my-reports/, { timeout: 10_000 })
    await expect(page.getByRole('heading', { name: /bejelentett hibáim/i })).toBeVisible()
  })

  test('navigates to new report via sidebar link', async ({ page }) => {
    await page.goto('/client/my-reports')
    await page.waitForLoadState('networkidle')

    const newReportLink = page.getByRole('link', { name: /új bejelentés/i })
    await expect(newReportLink).toBeVisible()
    await newReportLink.click()

    await page.waitForURL(/\/client\/new/, { timeout: 10_000 })
    await expect(page.getByRole('heading', { name: /hiba bejelentése/i })).toBeVisible()
  })

  test('new report page shows main form sections', async ({ page }) => {
    await page.goto('/client/new')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: /hiba bejelentése/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /probléma beküldése/i })).toBeVisible()
  })
})
