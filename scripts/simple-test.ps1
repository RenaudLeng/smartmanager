# Test simple de l'API

$BASE_URL = "http://localhost:3000/api"

Write-Host "🧪 Test simple de l'API..." -ForegroundColor Green

# Test login
$body = @{
    email = "admin@smartmanager.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/auth" -Method POST -Body $body -ContentType "application/json"
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "📧 Email: $($data.data.user.email)" -ForegroundColor Cyan
    Write-Host "👤 Rôle: $($data.data.user.role)" -ForegroundColor Cyan
    Write-Host "🔑 Token: $($data.data.token.Substring(0, 30))..." -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "📝 Détails: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

Write-Host "🎉 Test terminé !" -ForegroundColor Green
