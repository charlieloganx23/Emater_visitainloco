# Script para conectar o repositório local ao GitHub
# Execute este script APÓS criar o repositório no GitHub

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Script de Deploy - Observação In Loco" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Solicitar nome de usuário do GitHub
$username = Read-Host "Digite seu nome de usuário do GitHub"

# Solicitar nome do repositório
Write-Host ""
Write-Host "Nome sugerido: observacao-in-loco-emater" -ForegroundColor Yellow
$repoName = Read-Host "Digite o nome do repositório (ou pressione Enter para usar o sugerido)"

if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = "observacao-in-loco-emater"
}

Write-Host ""
Write-Host "Conectando ao repositório: https://github.com/$username/$repoName" -ForegroundColor Green
Write-Host ""

# Verificar se já existe um remote
$existingRemote = git remote -v 2>$null | Select-String "origin"

if ($existingRemote) {
    Write-Host "Remote 'origin' já existe. Removendo..." -ForegroundColor Yellow
    git remote remove origin
}

# Adicionar remote
git remote add origin "https://github.com/$username/$repoName.git"

# Renomear branch para main
Write-Host "Renomeando branch para 'main'..." -ForegroundColor Green
git branch -M main

# Fazer push
Write-Host ""
Write-Host "Fazendo push para o GitHub..." -ForegroundColor Green
Write-Host ""

$pushResult = git push -u origin main 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "  ✅ SUCESSO! Código enviado para o GitHub!" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Repositório: https://github.com/$username/$repoName" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Próximo passo: Deploy no Railway" -ForegroundColor Yellow
    Write-Host "1. Acesse https://railway.app/" -ForegroundColor White
    Write-Host "2. Crie um projeto MySQL" -ForegroundColor White
    Write-Host "3. Importe o arquivo schema.sql" -ForegroundColor White
    Write-Host "4. Deploy do repositório GitHub" -ForegroundColor White
    Write-Host ""
    Write-Host "Consulte DEPLOY_INSTRUCTIONS.md para detalhes" -ForegroundColor Cyan
    Write-Host ""
    
    # Perguntar se quer abrir o Railway
    $openRailway = Read-Host "Deseja abrir o Railway agora? (S/N)"
    if ($openRailway -eq "S" -or $openRailway -eq "s") {
        Start-Process "https://railway.app/"
    }
} else {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Red
    Write-Host "  ❌ ERRO ao fazer push" -ForegroundColor Red
    Write-Host "==================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host $pushResult -ForegroundColor Red
    Write-Host ""
    Write-Host "Possíveis soluções:" -ForegroundColor Yellow
    Write-Host "1. Verifique se o repositório foi criado no GitHub" -ForegroundColor White
    Write-Host "2. Verifique suas credenciais do Git" -ForegroundColor White
    Write-Host "3. Tente fazer login: git config credential.helper store" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
