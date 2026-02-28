import { test, expect } from '@playwright/test'

test.describe('Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/client/new')
    await page.waitForLoadState('networkidle')
  })

  test('theme toggle button is visible in the header', async ({ page }) => {
    // ModeToggle button uses Sun/Moon icons
    const themeBtn = page.getByRole('button', { name: /toggle theme|téma váltás/i })
    await expect(themeBtn).toBeVisible()
  })

  test('clicking theme toggle opens dropdown with theme options', async ({ page }) => {
    const themeBtn = page.getByRole('button', { name: /toggle theme|téma váltás/i })
    await themeBtn.click()

    await expect(page.getByRole('menuitem', { name: /light|világos/i })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: /dark|sötét/i })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: /system|rendszer/i })).toBeVisible()
  })

  test('selecting dark mode adds dark class to html', async ({ page }) => {
    const themeBtn = page.getByRole('button', { name: /toggle theme|téma váltás/i })
    await themeBtn.click()

    await page.getByRole('menuitem', { name: /dark|sötét/i }).click()

    await expect(page.locator('html')).toHaveClass(/dark/)
  })

  test('selecting light mode removes dark class from html', async ({ page }) => {
    // First switch to dark
    const themeBtn = page.getByRole('button', { name: /toggle theme|téma váltás/i })
    await themeBtn.click()
    await page.getByRole('menuitem', { name: /dark|sötét/i }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    // Then switch to light
    await themeBtn.click()
    await page.getByRole('menuitem', { name: /light|világos/i }).click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })
})
