# 🚀 DEPLOY RÁPIDO - 3 COMANDOS

## Passo 1: GitHub (Agora)
```powershell
# Execute este script para conectar ao GitHub
.\deploy-github.ps1
```

O script vai pedir:
1. Seu nome de usuário do GitHub
2. Nome do repositório (sugestão: observacao-in-loco-emater)

**Antes de executar:** Crie o repositório em https://github.com/new

---

## Passo 2: Railway - MySQL
1. Acesse https://railway.app/
2. Clique em "New Project" → "Deploy MySQL"
3. Copie as variáveis de conexão
4. Execute o schema.sql no banco

---

## Passo 3: Railway - Aplicação
1. No mesmo projeto, "New Service" → "GitHub repo"
2. Selecione o repositório que você criou
3. Configure as variáveis de ambiente (copie do MySQL)
4. Gere o domínio público
5. ✅ Pronto!

---

## 📖 Precisa de ajuda?
- **Guia completo:** DEPLOY_INSTRUCTIONS.md
- **Resumo executivo:** STATUS.md
- **Setup Railway:** RAILWAY_SETUP.md

---

**Tempo estimado: 20 minutos**
