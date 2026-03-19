// Script de test pour les API endpoints
// Exécutez avec: node scripts/test-api.js

const BASE_URL = 'http://localhost:3000/api'

// Tests
async function testAPIs() {
  console.log('🧪 Test des API endpoints...\n')

  try {
    // Test 1: Authentification
    console.log('1️⃣ Test Authentification')
    
    // Login avec SuperAdmin
    const loginResponse = await fetch(`${BASE_URL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@smartmanager.com',
        password: 'admin123'
      })
    })

    if (loginResponse.ok) {
      const loginData = await loginResponse.json()
      console.log('✅ Login SuperAdmin réussi')
      console.log('📧 Email:', loginData.data.user.email)
      console.log('👤 Rôle:', loginData.data.user.role)
      console.log('🔑 Token:', loginData.data.token.substring(0, 50) + '...')
      const token = loginData.data.token
      console.log('')

      // Test 2: Tenants API
      console.log('2️⃣ Test Tenants API')
      
      const tenantsResponse = await fetch(`${BASE_URL}/tenants`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (tenantsResponse.ok) {
        const tenantsData = await tenantsResponse.json()
        console.log('✅ Récupération tenants réussie')
        console.log('📊 Nombre de tenants:', tenantsData.data.length)
        console.log('📋 Premier tenant:', tenantsData.data[0]?.name || 'Aucun')
        console.log('')
      } else {
        console.log('❌ Erreur récupération tenants:', tenantsResponse.status)
      }

      // Test 3: Users API
      console.log('3️⃣ Test Users API')
      
      const usersResponse = await fetch(`${BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        console.log('✅ Récupération utilisateurs réussie')
        console.log('👥 Nombre d\'utilisateurs:', usersData.data.length)
        console.log('👤 Premier utilisateur:', usersData.data[0]?.name || 'Aucun')
        console.log('')
      } else {
        console.log('❌ Erreur récupération utilisateurs:', usersResponse.status)
      }

      // Test 4: System Config API
      console.log('4️⃣ Test System Config API')
      
      const configResponse = await fetch(`${BASE_URL}/system/config`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (configResponse.ok) {
        const configData = await configResponse.json()
        console.log('✅ Récupération configuration système réussie')
        console.log('⚙️ Nom plateforme:', configData.data.platform.name)
        console.log('🌍 Environnement:', configData.data.platform.environment)
        console.log('🔧 Auth 2FA:', configData.data.security.twoFactorAuth ? 'Activé' : 'Désactivé')
        console.log('')
      } else {
        console.log('❌ Erreur récupération configuration:', configResponse.status)
      }

      // Test 5: Reports API
      console.log('5️⃣ Test Reports API')
      
      const reportsResponse = await fetch(`${BASE_URL}/reports?type=tenants&period=month`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        console.log('✅ Génération rapport tenants réussie')
        console.log('📈 Total tenants:', reportsData.data.summary.totalTenants)
        console.log('🟢 Tenants actifs:', reportsData.data.summary.activeTenants)
        console.log('')
      } else {
        console.log('❌ Erreur génération rapport:', reportsResponse.status)
      }

      // Test 6: Backup API
      console.log('6️⃣ Test Backup API')
      
      const backupResponse = await fetch(`${BASE_URL}/system/backup`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (backupResponse.ok) {
        const backupData = await backupResponse.json()
        console.log('✅ Récupération sauvegardes réussie')
        console.log('💾 Nombre de sauvegardes:', backupData.data.length)
        console.log('📁 Dernière sauvegarde:', backupData.data[0]?.id || 'Aucune')
        console.log('')
      } else {
        console.log('❌ Erreur récupération sauvegardes:', backupResponse.status)
      }

    } else {
      console.log('❌ Erreur login SuperAdmin:', loginResponse.status)
      const errorData = await loginResponse.json()
      console.log('📝 Message:', errorData.error)
    }

    console.log('🎉 Tests terminés !')
    console.log('')
    console.log('📝 Note: Pour tester avec une vraie base de données:')
    console.log('1. Configurez DATABASE_URL dans .env.local')
    console.log('2. Lancez: npx prisma migrate dev')
    console.log('3. Lancez: npx ts-node scripts/init-db.ts')
    console.log('4. Relancez ce script de test')

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message)
    console.log('')
    console.log('💡 Assurez-vous que:')
    console.log('1. Le serveur de développement est lancé (npm run dev)')
    console.log('2. Le port 3000 est disponible')
    console.log('3. Les API endpoints sont correctement configurés')
  }
}

// Exécuter les tests
testAPIs()
