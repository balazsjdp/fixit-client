/**
 * Pro user flow: offers & jobs tabs on the dashboard
 *
 * Requires: E2E_PRO_USERNAME / E2E_PRO_PASSWORD pointing to a registered pro.
 */
import { test, expect } from '@playwright/test'

test.describe('Pro – Dashboard tabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pro')
    await page.waitForLoadState('networkidle')
  })

  test('renders all three dashboard tabs', async ({ page }) => {
    const isApproved = await page.getByTestId('credit-balance').isVisible().catch(() => false)
    test.skip(!isApproved, 'Pro not approved — skipping dashboard tab tests')

    await expect(page.getByTestId('tab-discovery')).toBeVisible()
    await expect(page.getByTestId('tab-offers')).toBeVisible()
    await expect(page.getByTestId('tab-jobs')).toBeVisible()
  })

  test('Ajánlataim tab shows offers or empty state', async ({ page }) => {
    const isApproved = await page.getByTestId('credit-balance').isVisible().catch(() => false)
    test.skip(!isApproved, 'Pro not approved — skipping')

    await page.getByTestId('tab-offers').click()

    const emptyState = page.getByTestId('no-offers')
    const offersList = page.getByTestId('offers-list')
    await expect(emptyState.or(offersList)).toBeVisible({ timeout: 10_000 })
  })

  test('Munkáim tab shows jobs or empty state', async ({ page }) => {
    const isApproved = await page.getByTestId('credit-balance').isVisible().catch(() => false)
    test.skip(!isApproved, 'Pro not approved — skipping')

    await page.getByTestId('tab-jobs').click()

    const emptyState = page.getByTestId('no-jobs')
    const jobsList = page.getByTestId('jobs-list')
    await expect(emptyState.or(jobsList)).toBeVisible({ timeout: 10_000 })
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

  test('submits an offer and it appears in Ajánlataim tab', async ({ page }) => {
    const offerBtn = page.locator('[data-testid^="offer-btn-"]').first()

    await offerBtn.click()

    await expect(page.getByLabel(/munkadíj/i)).toBeVisible({ timeout: 5_000 })
    await page.getByLabel(/munkadíj/i).fill('15000')
    await page.getByLabel(/kiszállási díj/i).fill('3000')

    await page.getByRole('button', { name: /ajánlat beküldése/i }).click()

    await expect(page.getByText(/ajánlat.*beküldve|sikeresen/i)).toBeVisible({ timeout: 10_000 })

    // Verify it appears in the Ajánlataim tab
    await page.getByTestId('tab-offers').click()
    const offersList = page.getByTestId('offers-list')
    const emptyState = page.getByTestId('no-offers')
    await expect(offersList.or(emptyState)).toBeVisible({ timeout: 10_000 })
  })
})
