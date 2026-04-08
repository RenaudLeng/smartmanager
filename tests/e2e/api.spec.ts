import { test, expect } from '@playwright/test'
import { TEST_CREDENTIALS, BASE_URL } from './smoke.spec'

test.describe('API E2E Tests', () => {
  let authToken: string

  test.beforeAll(async ({ request }) => {
    // Obtenir un token d'authentification
    const response = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: TEST_CREDENTIALS.TENANT.email,
        password: TEST_CREDENTIALS.TENANT.password
      }
    })
    
    const result = await response.json()
    authToken = result.token
  })

  test('GET /api/categories - List categories', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/categories`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(Array.isArray(data)).toBe(true)
  })

  test('POST /api/categories - Create category', async ({ request }) => {
    const categoryData = {
      name: 'Test API Category',
      description: 'Category created during E2E test'
    }

    const response = await request.post(`${BASE_URL}/api/categories`, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: categoryData
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.name).toBe(categoryData.name)
    expect(data.description).toBe(categoryData.description)
  })

  test('GET /api/products - List products', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/products`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(Array.isArray(data.products)).toBe(true)
  })

  test('POST /api/products - Create product', async ({ request }) => {
    // D'abord créer une catégorie pour le produit
    const categoryResponse = await request.post(`${BASE_URL}/api/categories`, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        name: 'Product Category Test',
        description: 'Category for product test'
      }
    })
    
    const category = await categoryResponse.json()
    
    const productData = {
      name: 'Test API Product',
      description: 'Product created during E2E test',
      price: 1500,
      currentStock: 50,
      minStock: 10,
      categoryId: category.id
    }

    const response = await request.post(`${BASE_URL}/api/products`, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: productData
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.name).toBe(productData.name)
    expect(data.price).toBe(productData.price)
  })

  test('GET /api/expenses - List expenses', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/expenses`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(Array.isArray(data.expenses)).toBe(true)
  })

  test('POST /api/expenses - Create expense', async ({ request }) => {
    const expenseData = {
      amount: 5000,
      description: 'Test expense E2E',
      categoryId: 'test-category-id'
    }

    const response = await request.post(`${BASE_URL}/api/expenses`, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: expenseData
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.amount).toBe(expenseData.amount)
    expect(data.description).toBe(expenseData.description)
  })

  test('GET /api/sales/stats - Sales statistics', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/sales/stats`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toHaveProperty('daily')
    expect(data.data).toHaveProperty('monthly')
  })

  test('API rate limiting', async ({ request }) => {
    const responses = await Promise.all(
      Array(6).fill(null).map(() =>
        request.post(`${BASE_URL}/api/auth/login`, {
          data: {
            email: 'test@test.com',
            password: 'wrongpassword'
          }
        })
      )
    )
    
    // Au moins une des requêtes doit être bloquée
    const rateLimitedResponses = responses.filter(r => r.status() === 429)
    expect(rateLimitedResponses.length).toBeGreaterThan(0)
  })

  test('API authentication protection', async ({ request }) => {
    // Tester sans token
    const response1 = await request.get(`${BASE_URL}/api/categories`)
    expect(response1.status()).toBe(401)
    
    // Tester avec token invalide
    const response2 = await request.get(`${BASE_URL}/api/categories`, {
      headers: { 'Authorization': 'Bearer invalid-token' }
    })
    expect(response2.status()).toBe(401)
  })

  test('API validation', async ({ request }) => {
    // Tester avec des données invalides
    const response = await request.post(`${BASE_URL}/api/categories`, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        name: '', // Nom vide
        description: 'Test'
      }
    })
    
    expect(response.status()).toBe(400)
    const data = await response.json()
    expect(data.error).toBeDefined()
  })
})
