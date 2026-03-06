/**
 * Pro user flow: dashboard, radius change, offer submission
 *
 * Requires: E2E_PRO_USERNAME / E2E_PRO_PASSWORD env vars pointing to a
 * registered (ideally approved) professional test user.
 *
 * If the pro user is pending approval, the pending-state tests run.
 * If the pro user is approved, the dashboard tests run.
 */
import { test, expect } from '@playwright/test'

test.describe('Pro Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pro')
    await page.waitForLoadState('networkidle')
  })

  test('renders the pro section (dashboard or pending state)', async ({ page }) => {
    // Either the dashboard heading or the pending approval message must be present
    const dashboard = page.getByRole('heading', { name: 'Dashboard' })
    const pending = page.getByText(/regisztráció folyamatban/i)
    const isDash = await dashboard.isVisible().catch(() => false)
    const isPending = await pending.isVisible().catch(() => false)
    expect(isDash || isPending).toBe(true)
  })

  test('sidebar shows pro navigation links', async ({ page }) => {
    await expect(page.getByRole('link', { name: /dashboard/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /ajánlataim/i })).toBeVisible()
  })
})

test.describe('Pro Dashboard – approved professional', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pro')
    await page.waitForLoadState('networkidle')

    // Skip the rest of this describe block if user is not approved yet
    const isDashboard = await page.getByTestId('credit-balance').isVisible().catch(() => false)
    test.skip(!isDashboard, 'Pro user is not yet approved — skipping dashboard tests')
  })

  test('shows credit balance', async ({ page }) => {
    await expect(page.getByTestId('credit-balance')).toBeVisible()
  })

  test('shows report count badge', async ({ page }) => {
    await expect(page.getByTestId('report-count')).toBeVisible()
  })

  test('shows nearby reports or empty state', async ({ page }) => {
    const noReports = page.getByTestId('no-reports')
    const reportCard = page.locator('[class*="rounded-xl"]').first()
    await expect(noReports.or(reportCard)).toBeVisible({ timeout: 10_000 })
  })

  test('radius slider is visible', async ({ page }) => {
    // RadiusSlider renders a Radix slider
    await expect(page.getByRole('slider')).toBeVisible()
  })

  test('email notification toggle is visible and toggleable', async ({ page }) => {
    const toggle = page.getByRole('switch', { name: /email értesítők/i })
    await expect(toggle).toBeVisible()

    const initialChecked = await toggle.isChecked()
    await toggle.click()
    await expect(toggle).toBeChecked({ checked: !initialChecked })

    // Restore original state
    await toggle.click()
    await expect(toggle).toBeChecked({ checked: initialChecked })
  })

  test('map is rendered', async ({ page }) => {
    // Leaflet map renders a .leaflet-container
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10_000 })
  })
})

test.describe('Pro Dashboard – offer modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pro')
    await page.waitForLoadState('networkidle')

    const hasOfferBtn = await page.locator('[data-testid^="offer-btn-"]').first().isVisible().catch(() => false)
    test.skip(!hasOfferBtn, 'No nearby reports available — skipping offer modal tests')
  })

  test('opens offer modal when "Ajánlat" button is clicked', async ({ page }) => {
    await page.locator('[data-testid^="offer-btn-"]').first().click()

    // Modal should appear with price inputs
    await expect(page.getByLabel(/munkadíj/i)).toBeVisible({ timeout: 5_000 })
    await expect(page.getByLabel(/kiszállási díj/i)).toBeVisible()
  })

  test('offer modal can be closed with Mégsem', async ({ page }) => {
    await page.locator('[data-testid^="offer-btn-"]').first().click()
    await expect(page.getByLabel(/munkadíj/i)).toBeVisible({ timeout: 5_000 })

    await page.getByRole('button', { name: /mégsem/i }).click()
    await expect(page.getByLabel(/munkadíj/i)).not.toBeVisible()
  })
})
