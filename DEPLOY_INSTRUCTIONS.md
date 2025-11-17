# 🚀 Instruções de Deploy - Passo a Passo

## ✅ Status Atual
- ✅ Repositório Git inicializado
- ✅ Commit inicial criado com todos os arquivos
- ✅ Projeto pronto para deploy

---

## 📤 1. Criar Repositório no GitHub

### Opção A: Via Interface Web (Recomendado)
1. Acesse https://github.com/new
2. Configure o repositório:
   - **Nome:** `observacao-in-loco-emater`
   - **Descrição:** Sistema de Observação In Loco - Emater-RO
   - **Visibilidade:** Público ou Privado (sua escolha)
   - **NÃO** marque "Initialize with README" (já temos um)
3. Clique em **"Create repository"**

### Opção B: Via GitHub CLI (se tiver instalado)
```powershell
gh repo create observacao-in-loco-emater --public --source=. --remote=origin --push
```

---

## 🔗 2. Conectar o Repositório Local ao GitHub

Após criar o repositório no GitHub, você verá comandos similares a estes. Execute no terminal:

```powershell
# Adicionar o remote do GitHub (substitua SEU_USUARIO pelo seu usuário GitHub)
git remote add origin https://github.com/SEU_USUARIO/observacao-in-loco-emater.git

# Renomear branch para main (padrão do GitHub)
git branch -M main

# Fazer push inicial
git push -u origin main
```

**Importante:** Substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub!

---

## 🚂 3. Deploy no Railway

### 3.1. Criar Projeto MySQL
1. Acesse https://railway.app/
2. Faça login com sua conta GitHub
3. Clique em **"New Project"**
4. Selecione **"Deploy MySQL"**
5. Aguarde o provisionamento (1-2 minutos)

### 3.2. Configurar o Banco de Dados
1. Clique no serviço **MySQL** criado
2. Vá na aba **"Variables"**
3. Anote as variáveis (você vai precisar):
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`

### 3.3. Importar o Schema SQL

#### Opção A: Via Railway CLI
```powershell
# Instalar Railway CLI
npm install -g @railway/cli

# Fazer login
railway login

# Conectar ao projeto
railway link

# Conectar ao MySQL e importar
railway run mysql -h $MYSQLHOST -P $MYSQLPORT -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE < schema.sql
```

#### Opção B: Via Cliente MySQL Local
```powershell
# Conectar ao MySQL do Railway (substitua os valores)
mysql -h SEU_MYSQLHOST -P SEU_MYSQLPORT -u root -p SEU_MYSQLDATABASE

# Dentro do MySQL
source schema.sql;
exit;
```

#### Opção C: Copiar e Colar
1. No Railway, clique no serviço MySQL
2. Clique em **"Query"** ou use um cliente como MySQL Workbench
3. Abra o arquivo `schema.sql`
4. Copie todo o conteúdo
5. Cole e execute no console MySQL

### 3.4. Deploy da Aplicação
1. No mesmo projeto Railway, clique em **"New Service"**
2. Selecione **"Deploy from GitHub repo"**
3. Autorize o Railway a acessar seus repositórios
4. Selecione o repositório `observacao-in-loco-emater`
5. O Railway detectará automaticamente que é Node.js

### 3.5. Configurar Variáveis de Ambiente
1. Clique no serviço da **aplicação** (não no MySQL)
2. Vá na aba **"Variables"**
3. Clique em **"Add Variable"** e adicione (use os valores do serviço MySQL):

```
DB_HOST=valor_do_MYSQLHOST
DB_PORT=valor_do_MYSQLPORT
DB_USER=valor_do_MYSQLUSER
DB_PASSWORD=valor_do_MYSQLPASSWORD
DB_NAME=valor_do_MYSQLDATABASE
PORT=3000
```

**Dica:** Você pode copiar as variáveis diretamente do serviço MySQL!

### 3.6. Gerar Domínio Público
1. No serviço da aplicação, vá em **"Settings"**
2. Role até **"Networking"**
3. Clique em **"Generate Domain"**
4. Copie a URL gerada (algo como: `seu-app.up.railway.app`)
5. Acesse a URL e teste! 🎉

---

## 🧪 4. Testar o Sistema

1. Acesse a URL do Railway
2. Teste criar uma nova visita:
   - Preencha os dados de identificação
   - Avance pelas 7 etapas
   - Responda as 32 perguntas
   - Salve a visita
3. Verifique a tabela de entrevistas
4. Abra o espelho de uma visita
5. Acesse o painel de indicadores
6. Teste exportar JSON e CSV

---

## 🔧 5. Comandos Git Úteis

### Ver status do repositório
```powershell
git status
```

### Adicionar novos arquivos/mudanças
```powershell
git add .
```

### Criar commit
```powershell
git commit -m "Descrição das mudanças"
```

### Enviar para GitHub
```powershell
git push
```

### Ver histórico de commits
```powershell
git log --oneline
```

### Criar nova branch
```powershell
git checkout -b nome-da-branch
```

---

## 📊 6. Monitoramento no Railway

### Ver Logs da Aplicação
1. Clique no serviço da aplicação
2. Vá na aba **"Deployments"**
3. Clique no deployment ativo
4. Veja os logs em tempo real

### Ver Logs do MySQL
1. Clique no serviço MySQL
2. Vá na aba **"Logs"**
3. Acompanhe as queries e conexões

### Métricas de Uso
1. Vá na página principal do projeto
2. Veja uso de CPU, memória e rede
3. Acompanhe o uso dos créditos gratuitos

---

## 🆘 Solução de Problemas

### Erro: "Cannot connect to MySQL"
**Solução:** Verifique se as variáveis de ambiente estão corretas no serviço da aplicação.

### Erro: "Table doesn't exist"
**Solução:** Execute o arquivo `schema.sql` no banco MySQL do Railway.

### Erro ao fazer push
**Solução:** 
```powershell
git pull origin main --rebase
git push origin main
```

### Deploy não atualiza
**Solução:** 
1. Vá no Railway, aba "Deployments"
2. Clique em "Redeploy"

---

## 🎯 Próximos Passos Após Deploy

1. [ ] Testar todas as funcionalidades
2. [ ] Criar algumas visitas de teste
3. [ ] Verificar gráficos e KPIs
4. [ ] Testar exportação de dados
5. [ ] Compartilhar URL com equipe
6. [ ] Configurar domínio personalizado (opcional)
7. [ ] Configurar backup automático dos dados

---

## 📞 Suporte

- **Railway Docs:** https://docs.railway.app/
- **Railway Discord:** https://discord.gg/railway
- **GitHub Docs:** https://docs.github.com/

---

**Sistema pronto para produção! 🚀**

Desenvolvido para **Emater-RO** - Novembro 2025
