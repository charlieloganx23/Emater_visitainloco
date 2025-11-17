# 🚂 DEPLOY AUTOMÁTICO NO RAILWAY - PASSO A PASSO

## ✅ Status Atual
- ✅ Railway CLI instalado
- ✅ Login realizado como: charlieloganx23@gmail.com
- ✅ Repositório GitHub pronto: charlieloganx23/Emater_visitainloco

---

## 🚀 OPÇÃO 1: Deploy via Interface Web (Mais Fácil)

### Passo 1: Criar Projeto MySQL (5 minutos)

1. No Railway (página já aberta), clique em **"Deploy MySQL"**
2. Aguarde o provisionamento (~2 minutos)
3. Clique no serviço MySQL criado
4. Vá na aba **"Variables"** e copie:
   ```
   MYSQLHOST=xxxx
   MYSQLPORT=xxxx
   MYSQLUSER=root
   MYSQLPASSWORD=xxxx
   MYSQLDATABASE=railway
   ```

### Passo 2: Importar Schema SQL

**Opção A - Via Railway CLI (no PowerShell):**
```powershell
# Conectar ao projeto (selecione o projeto criado)
railway link

# Importar schema
railway run bash -c "mysql -h \$MYSQLHOST -P \$MYSQLPORT -u \$MYSQLUSER -p\$MYSQLPASSWORD \$MYSQLDATABASE < schema.sql"
```

**Opção B - Copiar e Colar:**
1. Abra o arquivo `schema.sql` em um editor
2. No Railway, clique no MySQL → aba "Query" ou "Connect"
3. Cole todo o conteúdo do schema.sql e execute

### Passo 3: Deploy da Aplicação (3 minutos)

1. No mesmo projeto, clique em **"+ New"**
2. Selecione **"GitHub Repo"**
3. Autorize o Railway (se necessário)
4. Selecione: **charlieloganx23/Emater_visitainloco**
5. O deploy iniciará automaticamente

### Passo 4: Configurar Variáveis de Ambiente (2 minutos)

1. Clique no serviço da aplicação (não no MySQL)
2. Vá na aba **"Variables"**
3. Adicione uma por uma (ou clique "Raw Editor"):

```env
DB_HOST=valor_do_MYSQLHOST
DB_PORT=valor_do_MYSQLPORT
DB_USER=root
DB_PASSWORD=valor_do_MYSQLPASSWORD
DB_NAME=railway
PORT=3000
```

**Dica:** Você pode referenciar as variáveis do MySQL usando: `${{MySQL.MYSQLHOST}}`

### Passo 5: Gerar Domínio Público (1 minuto)

1. No serviço da aplicação, vá em **"Settings"**
2. Role até **"Networking"**
3. Clique em **"Generate Domain"**
4. Copie a URL gerada
5. Acesse e teste! 🎉

---

## 🚀 OPÇÃO 2: Deploy via CLI (Para Experts)

### Se você tem o projeto já linkado:

```powershell
# Ver status
railway status

# Fazer deploy
railway up

# Ver logs
railway logs

# Abrir no navegador
railway open
```

---

## 🔧 Comandos Úteis Railway CLI

```powershell
# Listar projetos
railway list

# Linkar a um projeto específico
railway link

# Ver variáveis de ambiente
railway variables

# Adicionar variável
railway variables set KEY=value

# Ver logs em tempo real
railway logs -f

# Abrir dashboard
railway open

# Ver status dos serviços
railway status
```

---

## 📊 Verificar Deploy

### Após o deploy, teste:

1. **Acesse a URL gerada**
2. **Teste criar uma visita:**
   - Preencha identificação
   - Responda as 32 perguntas
   - Salve
3. **Verifique a tabela de entrevistas**
4. **Abra o espelho de uma visita**
5. **Acesse o dashboard**
6. **Teste exportar JSON/CSV**

---

## ⚠️ Solução de Problemas

### Erro: "Cannot connect to database"
**Solução:**
```powershell
# Verificar variáveis
railway variables

# Testar conexão MySQL
railway run bash -c "mysql -h \$MYSQLHOST -P \$MYSQLPORT -u \$MYSQLUSER -p\$MYSQLPASSWORD -e 'SELECT 1;'"
```

### Erro: "Table doesn't exist"
**Solução:** Execute o schema.sql no banco MySQL

### Deploy travado
**Solução:**
```powershell
# Ver logs
railway logs -f

# Restart
railway restart
```

### Redeploy manual
```powershell
railway up --detach
```

---

## 🎯 Estrutura do Projeto Railway

Após configuração completa:

```
Projeto: observacao-in-loco-emater
│
├── 📦 MySQL (Serviço 1)
│   ├── MYSQLHOST
│   ├── MYSQLPORT
│   ├── MYSQLUSER
│   ├── MYSQLPASSWORD
│   └── MYSQLDATABASE
│
└── 🚀 Node.js App (Serviço 2)
    ├── Conectado ao GitHub
    ├── Variáveis de ambiente configuradas
    ├── Domínio público gerado
    └── Deploy automático no push
```

---

## 📈 Monitoramento

### Ver logs em tempo real:
```powershell
railway logs -f
```

### Ver uso de recursos:
```powershell
railway status
```

### Abrir dashboard:
```powershell
railway open
```

---

## 🔄 Atualizações Futuras

Sempre que fizer alterações no código:

```powershell
# Commit e push
git add .
git commit -m "feat: nova funcionalidade"
git push

# O Railway fará deploy automático!
# Acompanhe com: railway logs -f
```

---

## 💰 Planos Railway

- **Gratuito:** 500 horas/mês, 1GB RAM, 1GB disco
- **Pro:** $20/mês, uso ilimitado
- **Team:** A partir de $20/usuário/mês

**Estimativa para este projeto:**
- Uso baixo/médio: **GRATUITO indefinidamente**
- Uso alto: **~$5-10/mês**

---

## 📞 Suporte Railway

- **Docs:** https://docs.railway.app/
- **Discord:** https://discord.gg/railway
- **Status:** https://status.railway.app/

---

## ✅ Checklist de Deploy

- [ ] MySQL criado no Railway
- [ ] Variáveis do MySQL copiadas
- [ ] Schema.sql importado
- [ ] Aplicação conectada ao GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Domínio gerado
- [ ] Aplicação testada
- [ ] Sistema funcionando 100%

---

**Tempo estimado total: 15-20 minutos**

Após seguir estes passos, seu sistema estará **100% funcional em produção**! 🚀
