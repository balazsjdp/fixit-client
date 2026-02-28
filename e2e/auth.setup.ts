import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '.auth/user.json')

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8081'
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'FixIt'
// Default test user – created via Keycloak Admin API for E2E testing.
// In CI, override with E2E_USERNAME / E2E_PASSWORD secrets.
const E2E_USER = process.env.E2E_USERNAME || 'e2e-testuser@fixit.local'
const E2E_PASSWORD = process.env.E2E_PASSWORD || 'e2etest1234'

setup('authenticate via Keycloak', async ({ page }) => {
  // Navigate to the app – KeycloakProvider redirects to the Keycloak login page
  await page.goto('/')

  // Wait for Keycloak login page
  await page.waitForURL(`${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/**`, {
    timeout: 15_000,
  })

  // Fill credentials – use IDs to avoid ambiguity with the password-visibility toggle button
  await page.locator('#username').fill(E2E_USER)
  await page.locator('#password').fill(E2E_PASSWORD)
  await page.getByRole('button', { name: 'Sign In' }).click()

  // Wait for redirect back to the app after successful login
  await page.waitForURL('http://localhost:3000/**', { timeout: 15_000 })

  // Verify app is rendered after auth (the sidebar inset main has content)
  await expect(page.getByRole('main').first()).toBeVisible({ timeout: 10_000 })

  // Persist authentication state (cookies + localStorage) for all other tests
  await page.context().storageState({ path: authFile })
})
