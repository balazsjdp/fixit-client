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

  test('shows report cards or empty state', async ({ page }) => {
    // Either a report card (rounded-xl) or the empty state message must be present
    const emptyState = page.getByText(/még nincs bejelentett hibája/i)
    const reportCard = page.locator('[data-testid="report-card"]').first()
    const hasEmpty = await emptyState.isVisible().catch(() => false)
    const hasCard = await reportCard.isVisible().catch(() => false)
    expect(hasEmpty || hasCard).toBe(true)
  })

  test('shows "Részletek" button when reports exist', async ({ page }) => {
    const emptyState = page.getByText(/még nincs bejelentett hibája/i)
    const isEmpty = await emptyState.isVisible().catch(() => false)
    if (!isEmpty) {
      await expect(page.getByRole('button', { name: /részletek/i }).first()).toBeVisible()
    }
  })
})
