/**
 * Client user flow: submit report → view list → view detail → delete
 *
 * These tests run serially because they share state:
 * each test builds on the previous one's result.
 */
import { test, expect } from '@playwright/test'

// Unique title to identify the report created by this test run
const SHORT_DESC = `E2E teszt csap ${Date.now()}`
const DESCRIPTION = 'E2E teszt részletes leírás – vízvezeték szivárog a konyhai mosogató alatt.'

test.describe.serial('Client report flow', () => {
  // ── 1. Submit new report ────────────────────────────────────────────────────

  test('fills and submits the new report form', async ({ page }) => {
    // Mock external geocoding API to avoid network dependency and slow lookups
    await page.route('**/nominatim.openstreetmap.org/**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ lat: '47.6295', lon: '18.9156' }]),
      })
    )

    await page.goto('/client/new')
    await page.waitForLoadState('networkidle')

    // Select a category (wait for API load)
    const categoryBtn = page.locator('button').filter({ hasText: /vízvezetékszerelő|vízvezeték/i }).first()
    await expect(categoryBtn).toBeVisible({ timeout: 10_000 })
    await categoryBtn.click()
    await expect(page.getByText(/kiválasztott kategória/i)).toBeVisible()

    // Short description
    const shortDescInput = page.getByPlaceholder(/rövid, figyelemfelkeltő cím/i)
    await shortDescInput.fill(SHORT_DESC)

    // Long description
    await page.locator('textarea').fill(DESCRIPTION)

    // Address
    await page.getByLabel('Irányítószám').fill('2085')
    await page.getByLabel('Város').fill('Pilisvörösvár')
    await page.getByLabel('Közterület neve').fill('Fő út')
    await page.getByLabel('Házszám').fill('1')

    // Submit
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/reports') && resp.request().method() === 'POST', { timeout: 15_000 }),
      page.getByRole('button', { name: /probléma beküldése/i }).click(),
    ])
    const body = await response.json().catch(() => ({}))
    console.log('POST /api/reports status:', response.status(), JSON.stringify(body))

    // Success toast
    await expect(page.getByText(/hiba sikeresen bejelentve/i)).toBeVisible({ timeout: 10_000 })
  })

  // ── 2. Report appears in list ───────────────────────────────────────────────

  test('new report appears in my-reports list', async ({ page }) => {
    await page.goto('/client/my-reports')
    await page.waitForLoadState('networkidle')

    // The short description should appear as the card title
    await expect(page.getByText(SHORT_DESC)).toBeVisible({ timeout: 10_000 })

    // Status badge should be "Folyamatban"
    await expect(page.getByText('Folyamatban').first()).toBeVisible()
  })

  // ── 3. Report card expand/collapse ─────────────────────────────────────────

  test('can expand and collapse report description', async ({ page }) => {
    await page.goto('/client/my-reports')
    await page.waitForLoadState('networkidle')

    // Find the card for our report
    const card = page.locator('[data-testid="report-card"]').filter({ hasText: SHORT_DESC })
    await expect(card).toBeVisible({ timeout: 10_000 })

    // Expand
    await card.getByText(/részletek és leírás/i).click()
    await expect(card.getByText(DESCRIPTION)).toBeVisible()

    // Collapse
    await card.getByText(/kevesebb részlet/i).click()
    await expect(card.getByText(DESCRIPTION)).not.toBeVisible()
  })

  // ── 4. Navigate to detail page ──────────────────────────────────────────────

  test('clicking Részletek navigates to the detail page', async ({ page }) => {
    await page.goto('/client/my-reports')
    await page.waitForLoadState('networkidle')

    const card = page.locator('[data-testid="report-card"]').filter({ hasText: SHORT_DESC })
    await expect(card).toBeVisible({ timeout: 10_000 })

    await card.getByRole('button', { name: /részletek/i }).click()
    await page.waitForURL(/\/client\/my-reports\/\d+/, { timeout: 10_000 })

    // Header: short description visible
    await expect(page.getByText(SHORT_DESC)).toBeVisible()

    // Full description visible (not in expandable here – it's a dedicated section)
    await expect(page.getByText(DESCRIPTION)).toBeVisible()

    // Offers section heading
    await expect(page.getByText(/ajánlatok/i)).toBeVisible()

    // Empty offers state
    await expect(page.getByText(/még nem érkezett ajánlat/i)).toBeVisible()
  })

  // ── 5. Back navigation ──────────────────────────────────────────────────────

  test('back link from detail page returns to my-reports', async ({ page }) => {
    await page.goto('/client/my-reports')
    await page.waitForLoadState('networkidle')

    const card = page.locator('[data-testid="report-card"]').filter({ hasText: SHORT_DESC })
    await card.getByRole('button', { name: /részletek/i }).click()
    await page.waitForURL(/\/client\/my-reports\/\d+/, { timeout: 10_000 })

    await page.getByRole('link', { name: /vissza a bejelentésekhez/i }).click()
    await page.waitForURL(/\/client\/my-reports$/, { timeout: 10_000 })
    await expect(page.getByRole('heading', { name: /bejelentett hibáim/i })).toBeVisible()
  })

  // ── 6. Delete report ────────────────────────────────────────────────────────

  test('deletes the report via confirmation dialog', async ({ page }) => {
    await page.goto('/client/my-reports')
    await page.waitForLoadState('networkidle')

    const card = page.locator('[data-testid="report-card"]').filter({ hasText: SHORT_DESC })
    await expect(card).toBeVisible({ timeout: 10_000 })

    // Open delete dialog
    await card.getByRole('button', { name: /törlés/i }).click()
    await expect(page.getByText(/biztosan törli a bejelentést/i)).toBeVisible()

    // Confirm deletion
    await page.getByRole('dialog').getByRole('button', { name: /törlés/i }).click()

    // Success toast
    await expect(page.getByText(/sikeresen törölve/i)).toBeVisible({ timeout: 10_000 })

    // Report no longer visible
    await expect(page.getByText(SHORT_DESC)).not.toBeVisible({ timeout: 10_000 })
  })
})
