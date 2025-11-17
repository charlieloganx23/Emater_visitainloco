Write-Host "🧪 Testando API no Railway..." -ForegroundColor Cyan
Write-Host ""

$url = "https://ematervisitainloco-production.up.railway.app"

try {
    Write-Host "📡 GET /api/visitas" -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "$url/api/visitas" -Method Get
    Write-Host "✅ Status: OK" -ForegroundColor Green
    Write-Host "📊 Visitas encontradas: $($response.Count)" -ForegroundColor Green
    
    if ($response.Count -eq 0) {
        Write-Host "ℹ️  Banco de dados vazio (esperado)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🌐 Acessar aplicação: $url" -ForegroundColor Cyan
