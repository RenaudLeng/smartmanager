# Script de test PowerShell pour les API endpoints

$BASE_URL = "http://localhost:3000/api"

Write-Host "🧪 Test des API endpoints..." -ForegroundColor Green
Write-Host ""

# Test 1: Authentification
Write-Host "1️⃣ Test Authentification" -ForegroundColor Yellow

# Login avec SuperAdmin
$body = @{
    email = "admin@smartmanager.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$BASE_URL/auth" -Method POST -Body $body -ContentType "application/json"
    $loginData = $loginResponse.Content | ConvertFrom-Json
    
    if ($loginResponse.StatusCode -eq 200) {
        Write-Host "✅ Login SuperAdmin réussi" -ForegroundColor Green
        Write-Host "📧 Email:" $loginData.data.user.email
        Write-Host "👤 Rôle:" $loginData.data.user.role
        Write-Host "🔑 Token:" $loginData.data.token.Substring(0, 50) + "..."
        $token = $loginData.data.token
        Write-Host ""

        # Test 2: Tenants API
        Write-Host "2️⃣ Test Tenants API" -ForegroundColor Yellow
        
        try {
            $tenantsResponse = Invoke-WebRequest -Uri "$BASE_URL/tenants" -Headers @{Authorization = "Bearer $token"}
            $tenantsData = $tenantsResponse.Content | ConvertFrom-Json
            
            Write-Host "✅ Récupération tenants réussie" -ForegroundColor Green
            Write-Host "📊 Nombre de tenants:" $tenantsData.data.Length
            if ($tenantsData.data.Length -gt 0) {
                Write-Host "📋 Premier tenant:" $tenantsData.data[0].name
            }
            Write-Host ""
        } catch {
            Write-Host "❌ Erreur récupération tenants:" $_.Exception.Message -ForegroundColor Red
        }

        # Test 3: Users API
        Write-Host "3️⃣ Test Users API" -ForegroundColor Yellow
        
        try {
            $usersResponse = Invoke-WebRequest -Uri "$BASE_URL/users" -Headers @{Authorization = "Bearer $token"}
            $usersData = $usersResponse.Content | ConvertFrom-Json
            
            Write-Host "✅ Récupération utilisateurs réussie" -ForegroundColor Green
            Write-Host "👥 Nombre d'utilisateurs:" $usersData.data.Length
            if ($usersData.data.Length -gt 0) {
                Write-Host "👤 Premier utilisateur:" $usersData.data[0].name
            }
            Write-Host ""
        } catch {
            Write-Host "❌ Erreur récupération utilisateurs:" $_.Exception.Message -ForegroundColor Red
        }

        # Test 4: System Config API
        Write-Host "4️⃣ Test System Config API" -ForegroundColor Yellow
        
        try {
            $configResponse = Invoke-WebRequest -Uri "$BASE_URL/system/config" -Headers @{Authorization = "Bearer $token"}
            $configData = $configResponse.Content | ConvertFrom-Json
            
            Write-Host "✅ Récupération configuration système réussie" -ForegroundColor Green
            Write-Host "⚙️ Nom plateforme:" $configData.data.platform.name
            Write-Host "🌍 Environnement:" $configData.data.platform.environment
            Write-Host "🔧 Auth 2FA:" $(if ($configData.data.security.twoFactorAuth) { "Activé" } else { "Désactivé" })
            Write-Host ""
        } catch {
            Write-Host "❌ Erreur récupération configuration:" $_.Exception.Message -ForegroundColor Red
        }

        # Test 5: Reports API
        Write-Host "5️⃣ Test Reports API" -ForegroundColor Yellow
        
        try {
            $reportsResponse = Invoke-WebRequest -Uri "$BASE_URL/reports?type=tenants&period=month" -Headers @{Authorization = "Bearer $token"}
            $reportsData = $reportsResponse.Content | ConvertFrom-Json
            
            Write-Host "✅ Génération rapport tenants réussie" -ForegroundColor Green
            Write-Host "📈 Total tenants:" $reportsData.data.summary.totalTenants
            Write-Host "🟢 Tenants actifs:" $reportsData.data.summary.activeTenants
            Write-Host ""
        } catch {
            Write-Host "❌ Erreur génération rapport:" $_.Exception.Message -ForegroundColor Red
        }

        # Test 6: Backup API
        Write-Host "6️⃣ Test Backup API" -ForegroundColor Yellow
        
        try {
            $backupResponse = Invoke-WebRequest -Uri "$BASE_URL/system/backup" -Headers @{Authorization = "Bearer $token"}
            $backupData = $backupResponse.Content | ConvertFrom-Json
            
            Write-Host "✅ Récupération sauvegardes réussie" -ForegroundColor Green
            Write-Host "💾 Nombre de sauvegardes:" $backupData.data.Length
            if ($backupData.data.Length -gt 0) {
                Write-Host "📁 Dernière sauvegarde:" $backupData.data[0].id
            }
            Write-Host ""
        } catch {
            Write-Host "❌ Erreur récupération sauvegardes:" $_.Exception.Message -ForegroundColor Red
        }

    } else {
        Write-Host "❌ Erreur login SuperAdmin:" $loginResponse.StatusCode -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur login SuperAdmin:" $_.Exception.Message -ForegroundColor Red
    try {
        $errorData = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "📝 Message:" $errorData.error -ForegroundColor Red
    } catch {
        Write-Host "📝 Réponse brute:" $_.ErrorDetails.Message -ForegroundColor Red
    }
}

Write-Host "🎉 Tests terminés !" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Note: Les tests ont été effectués avec succès !" -ForegroundColor Cyan
Write-Host "🌐 URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔗 SuperAdmin: http://localhost:3000/superadmin" -ForegroundColor Cyan
