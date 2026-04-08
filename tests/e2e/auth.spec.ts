import { test, expect } from '@playwright/test'
import { TEST_CREDENTIALS, BASE_URL } from './smoke.spec'

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Nettoyer les cookies avant chaque test
    await page.context().clearCookies()
  })

  test('SuperAdmin login and dashboard access', async ({ page }) => {
    // 1. Accéder à la page de login
    await page.goto(`${BASE_URL}/auth/login`)
    
    // 2. Remplir le formulaire de login
    await page.fill('input[name="email"]', TEST_CREDENTIALS.SUPER_ADMIN.email)
    await page.fill('input[name="password"]', TEST_CREDENTIALS.SUPER_ADMIN.password)
    
    // 3. Cliquer sur le bouton de connexion
    await page.click('button[type="submit"]')
    
    // 4. Attendre la redirection vers le dashboard
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`)
    
    // 5. Vérifier la présence du rôle SuperAdmin
    await expect(page.locator('text=SuperAdmin')).toBeVisible()
    
    // 6. Vérifier l'accès aux fonctionnalités admin
    await expect(page.locator('text=Gestion des tenants')).toBeVisible()
  })

  test('Tenant login and business dashboard access', async ({ page }) => {
    // 1. Accéder à la page de login
    await page.goto(`${BASE_URL}/auth/login`)
    
    // 2. Remplir le formulaire de login tenant
    await page.fill('input[name="email"]', TEST_CREDENTIALS.TENANT.email)
    await page.fill('input[name="password"]', TEST_CREDENTIALS.TENANT.password)
    
    // 3. Cliquer sur le bouton de connexion
    await page.click('button[type="submit"]')
    
    // 4. Attendre la redirection vers le dashboard
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`)
    
    // 5. Vérifier la présence du rôle tenant
    await expect(page.locator('text=Boutique Test')).toBeVisible()
    
    // 6. Vérifier l'accès aux fonctionnalités de base
    await expect(page.locator('text=Ventes')).toBeVisible()
    await expect(page.locator('text=Produits')).toBeVisible()
    await expect(page.locator('text=Stock')).toBeVisible()
  })

  test('Login with invalid credentials', async ({ page }) => {
    // 1. Accéder à la page de login
    await page.goto(`${BASE_URL}/auth/login`)
    
    // 2. Remplir avec des identifiants invalides
    await page.fill('input[name="email"]', 'invalid@test.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    
    // 3. Cliquer sur le bouton de connexion
    await page.click('button[type="submit"]')
    
    // 4. Vérifier le message d'erreur
    await expect(page.locator('text=Identifiants invalides')).toBeVisible()
    
    // 5. Vérifier qu'on reste sur la page de login
    await expect(page).toHaveURL(`${BASE_URL}/auth/login`)
  })

  test('Rate limiting protection', async ({ page }) => {
    // 1. Tenter 6 connexions avec mauvais identifiants
    for (let i = 0; i < 6; i++) {
      await page.goto(`${BASE_URL}/auth/login`)
      await page.fill('input[name="email"]', 'test@test.com')
      await page.fill('input[name="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')
      
      // Attendre un peu pour la requête
      await page.waitForTimeout(500)
    }
    
    // 2. Vérifier le message de rate limiting
    await expect(page.locator('text=Trop de tentatives')).toBeVisible()
  })

  test('Protected routes redirect unauthenticated users', async ({ page }) => {
    // 1. Essayer d'accéder directement au dashboard
    await page.goto(`${BASE_URL}/dashboard`)
    
    // 2. Vérifier la redirection vers login
    await expect(page).toHaveURL(`${BASE_URL}/auth/login`)
    
    // 3. Essayer d'accéder à une route API protégée
    const response = await page.request.get(`${BASE_URL}/api/categories`)
    expect(response.status()).toBe(401)
  })

  test('Session persistence', async ({ page }) => {
    // 1. Se connecter
    await page.goto(`${BASE_URL}/auth/login`)
    await page.fill('input[name="email"]', TEST_CREDENTIALS.TENANT.email)
    await page.fill('input[name="password"]', TEST_CREDENTIALS.TENANT.password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`)
    
    // 2. Recharger la page
    await page.reload()
    
    // 3. Vérifier qu'on reste connecté
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`)
    await expect(page.locator('text=Boutique Test')).toBeVisible()
  })
})
