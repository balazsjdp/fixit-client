import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '.auth/pro.json')

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8081'
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'FixIt'
const E2E_PRO_USER = process.env.E2E_PRO_USERNAME || 'e2e-prouser@fixit.local'
const E2E_PRO_PASSWORD = process.env.E2E_PRO_PASSWORD || 'e2etest1234'

setup('authenticate pro user via Keycloak', async ({ page }) => {
  await page.goto('/')

  await page.waitForURL(`${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/**`, {
    timeout: 15_000,
  })

  await page.locator('#username').fill(E2E_PRO_USER)
  await page.locator('#password').fill(E2E_PRO_PASSWORD)
  await page.getByRole('button', { name: 'Sign In' }).click()

  await page.waitForURL('http://localhost:3000/**', { timeout: 15_000 })
  await expect(page.getByRole('main').first()).toBeVisible({ timeout: 10_000 })

  await page.context().storageState({ path: authFile })
})
