import { test, expect } from '@playwright/test'

test.describe('New Report Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/client/new')
    await page.waitForLoadState('networkidle')
  })

  test('displays the page heading and submit button', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /hiba bejelentése/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /probléma beküldése/i })).toBeVisible()
  })

  test('shows category selector with categories', async ({ page }) => {
    // Wait for the category section heading to appear
    await expect(page.getByText(/kategória kiválasztása/i)).toBeVisible({ timeout: 10_000 })

    // At least one category button should be visible after loading from API
    const categoryButtons = page.locator('button').filter({
      hasText: /vízvezetékszerelő|villanyszerelő|fűtés|asztalos|festő|háztartási|burkoló|egyéb/i,
    })
    await expect(categoryButtons.first()).toBeVisible({ timeout: 10_000 })
  })

  test('selecting a category shows selected state', async ({ page }) => {
    // Wait for categories to load
    const categoryBtn = page.locator('button').filter({ hasText: /vízvezetékszerelő/i })
    await expect(categoryBtn).toBeVisible({ timeout: 10_000 })
    await categoryBtn.click()

    // After clicking, a confirmation text should appear
    await expect(page.getByText(/kiválasztott kategória/i)).toBeVisible()
  })

  test('image upload area is visible', async ({ page }) => {
    await expect(page.getByText(/kattintson vagy húzza ide a képeket/i)).toBeVisible()
  })

  test('description textarea accepts input', async ({ page }) => {
    const textarea = page.locator('textarea')
    await expect(textarea).toBeVisible()
    await textarea.fill('Csöpögő cső a konyhában')
    await expect(textarea).toHaveValue('Csöpögő cső a konyhában')
  })

  test('urgency slider is visible with labels', async ({ page }) => {
    await expect(page.getByText(/sürgősségi szint/i).first()).toBeVisible()
    await expect(page.getByText(/ráér/i).first()).toBeVisible()
    await expect(page.getByText(/sürgős/i).first()).toBeVisible()
  })

  test('address form fields are visible', async ({ page }) => {
    // Address form uses htmlFor labels: "Irányítószám", "Város", "Közterület neve", "Házszám"
    await expect(page.getByLabel('Irányítószám')).toBeVisible()
    await expect(page.getByLabel('Város')).toBeVisible()
    await expect(page.getByLabel('Közterület neve')).toBeVisible()
    await expect(page.getByLabel('Házszám')).toBeVisible()
  })

  test('address fields accept input', async ({ page }) => {
    await page.getByLabel('Irányítószám').fill('1234')
    await page.getByLabel('Város').fill('Budapest')
    await page.getByLabel('Közterület neve').fill('Fő utca')
    await page.getByLabel('Házszám').fill('42')

    await expect(page.getByLabel('Irányítószám')).toHaveValue('1234')
    await expect(page.getByLabel('Város')).toHaveValue('Budapest')
  })
})
