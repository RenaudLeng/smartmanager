import { test, expect } from '@playwright/test'
import { TEST_CREDENTIALS, BASE_URL } from './smoke.spec'

test.describe('Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Se connecter avant chaque test
    await page.goto(`${BASE_URL}/auth/login`)
    await page.fill('input[name="email"]', TEST_CREDENTIALS.TENANT.email)
    await page.fill('input[name="password"]', TEST_CREDENTIALS.TENANT.password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`)
  })

  test('Dashboard navigation and layout', async ({ page }) => {
    // Vérifier la présence des éléments principaux
    await expect(page.locator('text=Tableau de bord')).toBeVisible()
    await expect(page.locator('text=Boutique Test')).toBeVisible()
    
    // Vérifier le menu de navigation
    await expect(page.locator('text=Ventes')).toBeVisible()
    await expect(page.locator('text=Produits')).toBeVisible()
    await expect(page.locator('text=Stock')).toBeVisible()
    await expect(page.locator('text=Clients')).toBeVisible()
    await expect(page.locator('text=Dépenses')).toBeVisible()
    await expect(page.locator('text=Rapports')).toBeVisible()
  })

  test('Stock management workflow', async ({ page }) => {
    // Naviguer vers la page de stock
    await page.click('text=Stock')
    await expect(page).toHaveURL(`${BASE_URL}/dashboard/stock`)
    
    // Vérifier la présence du tableau de produits
    await expect(page.locator('table')).toBeVisible()
    
    // Vérifier les actions disponibles
    await expect(page.locator('text=Ajouter un produit')).toBeVisible()
    await expect(page.locator('text=Ajouter une catégorie')).toBeVisible()
    
    // Tester l'ajout de catégorie
    await page.click('text=Ajouter une catégorie')
    await page.fill('input[name="name"]', 'Test E2E Category')
    await page.fill('textarea[name="description"]', 'Category created during E2E test')
    await page.click('text=Enregistrer')
    
    // Vérifier le message de succès
    await expect(page.locator('text=Catégorie créée avec succès')).toBeVisible()
  })

  test('Product management workflow', async ({ page }) => {
    // Naviguer vers la page de stock
    await page.click('text=Stock')
    await expect(page).toHaveURL(`${BASE_URL}/dashboard/stock`)
    
    // Ajouter un produit test
    await page.click('text=Ajouter un produit')
    await page.fill('input[name="name"]', 'Test E2E Product')
    await page.fill('input[name="price"]', '1500')
    await page.fill('input[name="currentStock"]', '50')
    await page.fill('input[name="minStock"]', '10')
    
    // Sélectionner une catégorie
    await page.selectOption('select[name="categoryId"]', { label: 'Test E2E Category' })
    
    // Enregistrer le produit
    await page.click('text=Enregistrer')
    
    // Vérifier le message de succès
    await expect(page.locator('text=Produit créé avec succès')).toBeVisible()
  })

  test('Sales workflow', async ({ page }) => {
    // Naviguer vers le POS
    await page.click('text=Ventes')
    await expect(page).toHaveURL(`${BASE_URL}/dashboard/pos`)
    
    // Vérifier l'interface du POS
    await expect(page.locator('text=Point de vente')).toBeVisible()
    await expect(page.locator('text=Nouveau')).toBeVisible()
    
    // Ajouter un produit au panier
    await page.click('text=Nouveau')
    await page.click('text=Test E2E Product')
    await page.fill('input[name="quantity"]', '2')
    await page.click('text=Ajouter')
    
    // Vérifier le panier
    await expect(page.locator('text=Test E2E Product')).toBeVisible()
    await expect(page.locator('text=2')).toBeVisible()
    
    // Finaliser la vente
    await page.click('text=Payer')
    await expect(page.locator('text=Vente finalisée')).toBeVisible()
  })

  test('Customer management workflow', async ({ page }) => {
    // Naviguer vers la page clients
    await page.click('text=Clients')
    await expect(page).toHaveURL(`${BASE_URL}/dashboard/clients`)
    
    // Vérifier la liste des clients
    await expect(page.locator('text=Clients')).toBeVisible()
    
    // Ajouter un nouveau client
    await page.click('text=Ajouter un client')
    await page.fill('input[name="name"]', 'Client E2E Test')
    await page.fill('input[name="email"]', 'client@test.com')
    await page.fill('input[name="phone"]', '+226123456789')
    
    // Enregistrer le client
    await page.click('text=Enregistrer')
    await expect(page.locator('text=Client créé avec succès')).toBeVisible()
  })

  test('Expense tracking workflow', async ({ page }) => {
    // Naviguer vers la page dépenses
    await page.click('text=Dépenses')
    await expect(page).toHaveURL(`${BASE_URL}/dashboard/depenses`)
    
    // Vérifier l'interface
    await expect(page.locator('text=Dépenses du jour')).toBeVisible()
    
    // Ajouter une dépense
    await page.click('text=Nouvelle dépense')
    await page.fill('input[name="amount"]', '5000')
    await page.fill('textarea[name="description"]', 'Test expense E2E')
    await page.selectOption('select[name="categoryId"]', { label: 'Fournitures' })
    
    // Enregistrer la dépense
    await page.click('text=Enregistrer')
    await expect(page.locator('text=Dépense enregistrée')).toBeVisible()
  })

  test('Reports and analytics', async ({ page }) => {
    // Naviguer vers les rapports
    await page.click('text=Rapports')
    await expect(page).toHaveURL(`${BASE_URL}/dashboard/reports`)
    
    // Vérifier les graphiques et statistiques
    await expect(page.locator('text=Rapports financiers')).toBeVisible()
    await expect(page.locator('text=Analyse des ventes')).toBeVisible()
    
    // Tester un rapport
    await page.click('text=Rapport des ventes')
    await expect(page.locator('text=Période')).toBeVisible()
    await page.click('text=Générer')
    await expect(page.locator('text=Rapport généré')).toBeVisible()
  })

  test('Settings and configuration', async ({ page }) => {
    // Naviguer vers les paramètres
    await page.click('text=Paramètres')
    await expect(page).toHaveURL(`${BASE_URL}/dashboard/settings`)
    
    // Vérifier les sections
    await expect(page.locator('text=Informations du commerce')).toBeVisible()
    await expect(page.locator('text=Gestion des utilisateurs')).toBeVisible()
    
    // Modifier les informations
    await page.click('text=Modifier')
    await page.fill('input[name="phone"]', '+226987654321')
    await page.click('text=Enregistrer')
    await expect(page.locator('text=Modifications enregistrées')).toBeVisible()
  })
})
