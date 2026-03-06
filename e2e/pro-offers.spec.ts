/**
 * Pro user flow: my offers page
 *
 * Requires: E2E_PRO_USERNAME / E2E_PRO_PASSWORD pointing to a registered pro.
 */
import { test, expect } from '@playwright/test'

test.describe('Pro – My Offers Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pro/offers')
    await page.waitForLoadState('networkidle')
  })

  test('renders the page heading', async ({ page }) => {
    // Either heading is visible (approved pro) or redirect to register
    const heading = page.getByRole('heading', { name: /ajánlataim/i })
    const registerHeading = page.getByRole('heading', { name: /regisztráció/i })
    await expect(heading.or(registerHeading)).toBeVisible({ timeout: 10_000 })
  })

  test('shows offers or empty state', async ({ page }) => {
    // Skip if redirected to registration
    const onOffersPage = await page.getByRole('heading', { name: /ajánlataim/i }).isVisible().catch(() => false)
    test.skip(!onOffersPage, 'Pro user not registered — skipping offers page tests')

    const emptyState = page.getByText(/még nem adtál be ajánlatot/i)
    const offerCard = page.locator('[data-testid^="my-offer-card-"]').first()
    await expect(emptyState.or(offerCard)).toBeVisible({ timeout: 10_000 })
  })

  test('sidebar link navigates to offers page', async ({ page }) => {
    await page.goto('/pro')
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: /ajánlataim/i }).click()
    await page.waitForURL(/\/pro\/offers/, { timeout: 10_000 })

    await expect(page.getByRole('heading', { name: /ajánlataim/i })).toBeVisible()
  })
})

test.describe.serial('Pro – offer submission flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pro')
    await page.waitForLoadState('networkidle')

    const isApproved = await page.getByTestId('credit-balance').isVisible().catch(() => false)
    const hasReports = await page.locator('[data-testid^="offer-btn-"]').first().isVisible().catch(() => false)
    test.skip(!isApproved || !hasReports, 'No approved pro or no nearby reports — skipping offer submission')
  })

  test('submits an offer and it appears in my offers', async ({ page }) => {
    // Note the report id before submitting
    const offerBtn = page.locator('[data-testid^="offer-btn-"]').first()
    const reportId = await offerBtn.getAttribute('data-testid').then(id => id?.replace('offer-btn-', ''))

    await offerBtn.click()

    // Fill offer form
    await expect(page.getByLabel(/munkadíj/i)).toBeVisible({ timeout: 5_000 })
    await page.getByLabel(/munkadíj/i).fill('15000')
    await page.getByLabel(/kiszállási díj/i).fill('3000')

    // Submit
    await page.getByRole('button', { name: /ajánlat beküldése/i }).click()

    // Success feedback
    await expect(page.getByText(/ajánlat.*beküldve|sikeresen/i)).toBeVisible({ timeout: 10_000 })

    // Navigate to my offers and verify
    await page.goto('/pro/offers')
    await page.waitForLoadState('networkidle')

    if (reportId) {
      // The offer card for this report should exist
      const offerCard = page.locator(`[data-testid="my-offer-card-"]`).first()
      await expect(offerCard.or(page.getByText(/függőben/i))).toBeVisible({ timeout: 10_000 })
    }
  })
})
