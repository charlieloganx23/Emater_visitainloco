# Script PowerShell para configurar MySQL no Railway
# Execute este script: .\configure-railway-mysql.ps1

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🚂 CONFIGURAÇÃO AUTOMÁTICA RAILWAY + MYSQL          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "Verificando login no Railway..." -ForegroundColor Yellow
$whoami = railway whoami 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Logado no Railway`n" -ForegroundColor Green
} else {
    Write-Host "❌ Erro: Não logado no Railway" -ForegroundColor Red
    Write-Host "Execute: railway login`n" -ForegroundColor Yellow
    exit
}

Write-Host "Abrindo Railway para adicionar MySQL..." -ForegroundColor Yellow
Write-Host "Por favor, siga estes passos MANUALMENTE:`n" -ForegroundColor White

Write-Host "1️⃣  ADICIONAR MYSQL:" -ForegroundColor Cyan
Write-Host "   → Vá para: https://railway.app/project/faithful-joy" -ForegroundColor White
Write-Host "   → Clique em '+ New'" -ForegroundColor White
Write-Host "   → Selecione 'Database' → 'Add MySQL'" -ForegroundColor White
Write-Host "   → Aguarde o provisionamento (2 min)`n" -ForegroundColor White

Write-Host "Pressione ENTER após adicionar o MySQL..." -ForegroundColor Yellow
$null = Read-Host

Write-Host "`n2️⃣  CONFIGURANDO VARIÁVEIS DE AMBIENTE..." -ForegroundColor Cyan

# Variáveis que precisam ser configuradas
$variables = @{
    "DB_HOST" = "`${{MySQL.MYSQLHOST}}"
    "DB_PORT" = "`${{MySQL.MYSQLPORT}}"
    "DB_USER" = "`${{MySQL.MYSQLUSER}}"
    "DB_PASSWORD" = "`${{MySQL.MYSQLPASSWORD}}"
    "DB_NAME" = "`${{MySQL.MYSQLDATABASE}}"
    "PORT" = "8080"
}

Write-Host "Copie estas variáveis para o serviço Emater_visitainloco:`n" -ForegroundColor White

foreach ($key in $variables.Keys) {
    Write-Host "   $key=$($variables[$key])" -ForegroundColor Green
}

Write-Host "`nOu use o Raw Editor e cole tudo de uma vez:`n" -ForegroundColor Yellow
foreach ($key in $variables.Keys) {
    Write-Host "$key=$($variables[$key])"
}

# Copiar para clipboard
$envContent = ($variables.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "`n"
Set-Clipboard -Value $envContent
Write-Host "`n✅ Variáveis copiadas para o clipboard!" -ForegroundColor Green
Write-Host "Cole no Raw Editor do Railway (Ctrl+V)`n" -ForegroundColor Yellow

Write-Host "Pressione ENTER após configurar as variáveis..." -ForegroundColor Yellow
$null = Read-Host

Write-Host "`n3️⃣  IMPORTANDO SCHEMA SQL..." -ForegroundColor Cyan

# Verificar se schema.sql existe
if (Test-Path "schema.sql") {
    Write-Host "✅ Arquivo schema.sql encontrado" -ForegroundColor Green
    Write-Host "`nEscolha o método de importação:`n" -ForegroundColor Yellow
    
    Write-Host "A) Via Railway Web (Recomendado)" -ForegroundColor Cyan
    Write-Host "   1. No Railway, clique no serviço MySQL" -ForegroundColor White
    Write-Host "   2. Vá em 'Data' ou 'Query'" -ForegroundColor White
    Write-Host "   3. Copie e cole o conteúdo de schema.sql" -ForegroundColor White
    Write-Host "   4. Execute`n" -ForegroundColor White
    
    Write-Host "B) Abrir schema.sql agora para copiar? (S/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq "S" -or $response -eq "s") {
        code schema.sql
        Write-Host "✅ schema.sql aberto no VS Code" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Arquivo schema.sql não encontrado!" -ForegroundColor Red
}

Write-Host "`nPressione ENTER após importar o schema..." -ForegroundColor Yellow
$null = Read-Host

Write-Host "`n4️⃣  REDEPLOY DA APLICAÇÃO..." -ForegroundColor Cyan
Write-Host "   → Vá para: Emater_visitainloco → Deployments" -ForegroundColor White
Write-Host "   → Clique nos 3 pontos → Redeploy`n" -ForegroundColor White

Write-Host "Deseja abrir o Railway agora? (S/N)" -ForegroundColor Yellow
$response = Read-Host
if ($response -eq "S" -or $response -eq "s") {
    Start-Process "https://railway.app/project/faithful-joy"
}

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              ✅ CONFIGURAÇÃO CONCLUÍDA!                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "Após o redeploy, acesse:" -ForegroundColor Cyan
Write-Host "https://ematervisitainloco-production.up.railway.app`n" -ForegroundColor Yellow

Write-Host "Ver logs em tempo real:" -ForegroundColor Cyan
Write-Host "railway logs -f`n" -ForegroundColor White
