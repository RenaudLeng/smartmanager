// Tests E2E simplifiés pour SmartManager
// Ces tests peuvent être exécutés manuellement ou avec n'importe quel framework de test

export const TEST_CREDENTIALS = {
  SUPER_ADMIN: {
    email: 'admin@smartmanager.com',
    password: 'admin123'
  },
  TENANT: {
    email: 'tenant@test.com', 
    password: 'tenant123'
  }
}

export const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

// Tests manuels - à exécuter dans le navigateur
export const MANUAL_TESTS = {
  'SuperAdmin Login': `
    1. Aller sur ${BASE_URL}
    2. Entrer email: ${TEST_CREDENTIALS.SUPER_ADMIN.email}
    3. Entrer mot de passe: ${TEST_CREDENTIALS.SUPER_ADMIN.password}
    4. Cliquer sur "Se connecter"
    5. Vérifier redirection vers /dashboard
    6. Vérifier présence "SuperAdmin" dans l'interface
  `,
  
  'Tenant Login': `
    1. Aller sur ${BASE_URL}
    2. Entrer email: ${TEST_CREDENTIALS.TENANT.email}
    3. Entrer mot de passe: ${TEST_CREDENTIALS.TENANT.password}
    4. Cliquer sur "Se connecter"
    5. Vérifier redirection vers /dashboard
    6. Vérifier présence "Boutique Test" dans l'interface
  `,
  
  'Navigation Products': `
    1. Se connecter en tant que tenant
    2. Cliquer sur "Produits"
    3. Vérifier URL: ${BASE_URL}/dashboard/products
    4. Vérifier titre "Gestion des produits"
  `,
  
  'Create Category': `
    1. Aller dans /dashboard/categories
    2. Cliquer "Ajouter une catégorie"
    3. Entrer nom: "Test E2E"
    4. Entrer description: "Description test"
    5. Cliquer "Enregistrer"
    6. Vérifier message de succès
    7. Vérifier catégorie dans la liste
  `,
  
  'Rate Limiting': `
    1. Aller sur ${BASE_URL}
    2. Tenter 6 connexions avec mauvais mot de passe
    3. La 6ème doit afficher "Too many requests"
  `
}

// Tests API - à exécuter avec curl ou Postman
export const API_TESTS = {
  'Health Check': `curl ${BASE_URL}/api/health`,
  
  'Login Success': `curl -X POST ${BASE_URL}/api/auth/login \\
    -H "Content-Type: application/json" \\
    -d '{"email":"${TEST_CREDENTIALS.TENANT.email}","password":"${TEST_CREDENTIALS.TENANT.password}"}'`,
  
  'Login Rate Limit': `for i in {1..6}; do \\
    curl -X POST ${BASE_URL}/api/auth/login \\
    -H "Content-Type: application/json" \\
    -d '{"email":"test@test.com","password":"wrong"}'; done`,
  
  'Protected Route': `curl -H "Authorization: Bearer TOKEN_HERE" ${BASE_URL}/api/categories`
}

// Tests de performance
export const PERFORMANCE_TESTS = {
  'Page Load Time': `
    1. Ouvrir les outils de développement (F12)
    2. Aller sur ${BASE_URL}/dashboard
    3. Vérifier que "Load" < 3 secondes
    4. Vérifier que les requêtes API < 2 secondes
  `,
  
  'Bundle Size': `
    1. Ouvrir l'onglet "Network"
    2. Charger ${BASE_URL}
    3. Vérifier que le bundle JS < 1MB
  `
}

// Tests de sécurité
export const SECURITY_TESTS = {
  'XSS Protection': `
    1. Aller sur ${BASE_URL}
    2. Entrer email: <script>alert("xss")</script>@test.com
    3. Entrer mot de passe: password123
    4. Cliquer "Se connecter"
    5. Vérifier qu'aucune alerte n'apparaît
  `,
  
  'CSRF Protection': `
    1. Ouvrir un nouvel onglet (sans cookies)
    2. Essayer d'accéder à ${BASE_URL}/api/categories
    3. Vérifier réponse 401/403
  `
}

// Fonctions utilitaires pour les tests automatisés
export class SmartManagerTester {
  constructor(private baseURL: string = BASE_URL) {}

  async login(credentials: typeof TEST_CREDENTIALS.TENANT) {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    
    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`)
    }
    
    return response.json()
  }

  async checkHealth() {
    const response = await fetch(`${this.baseURL}/api/health`)
    return response.ok
  }

  async testRateLimit() {
    const promises = Array(6).fill(null).map(() =>
      fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'wrong' })
      })
    )
    
    const results = await Promise.all(promises)
    return results.some(r => r.status === 429)
  }
}

// Export par défaut pour utilisation facile
export default {
  TEST_CREDENTIALS,
  BASE_URL,
  MANUAL_TESTS,
  API_TESTS,
  PERFORMANCE_TESTS,
  SECURITY_TESTS,
  SmartManagerTester
}
