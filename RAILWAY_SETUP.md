# 🚀 Guia de Deploy no Railway com MySQL

## Passo a Passo para Configurar o Banco de Dados MySQL no Railway

### 1. Criar Conta no Railway
1. Acesse https://railway.app/
2. Faça login com sua conta GitHub
3. Você ganhará créditos gratuitos para começar

### 2. Criar Novo Projeto
1. No dashboard do Railway, clique em **"New Project"**
2. Selecione **"Deploy MySQL"**
3. Aguarde o Railway provisionar o banco de dados

### 3. Configurar o Banco de Dados MySQL
1. Clique no serviço MySQL criado
2. Vá na aba **"Variables"**
3. Copie as seguintes variáveis que o Railway criou automaticamente:
   - `MYSQL_HOST` (ou `MYSQLHOST`)
   - `MYSQL_PORT` (ou `MYSQLPORT`)
   - `MYSQL_USER` (ou `MYSQLUSER`)
   - `MYSQL_PASSWORD` (ou `MYSQLPASSWORD`)
   - `MYSQL_DATABASE` (ou `MYSQLDATABASE`)
   - `MYSQL_URL` (URL completa de conexão)

### 4. Importar o Schema SQL
Você pode importar o schema de duas formas:

#### Opção A: Via Railway CLI
```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Fazer login
railway login

# Conectar ao projeto
railway link

# Executar o schema
railway run mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < schema.sql
```

#### Opção B: Via Cliente MySQL Local
```bash
# Conectar ao MySQL do Railway
mysql -h [MYSQL_HOST] -P [MYSQL_PORT] -u [MYSQL_USER] -p[MYSQL_PASSWORD] [MYSQL_DATABASE]

# Dentro do MySQL, executar:
source schema.sql;
```

#### Opção C: Via Railway Web Console
1. No serviço MySQL, clique em **"Connect"**
2. Use o MySQL Workbench ou outro cliente SQL
3. Cole e execute o conteúdo do arquivo `schema.sql`

### 5. Deploy da Aplicação no Railway
1. No mesmo projeto, clique em **"New Service"**
2. Selecione **"Deploy from GitHub repo"**
3. Conecte seu repositório GitHub com o código
4. O Railway detectará automaticamente que é um projeto Node.js

### 6. Configurar Variáveis de Ambiente da Aplicação
1. Clique no serviço da aplicação (Node.js)
2. Vá na aba **"Variables"**
3. Adicione as seguintes variáveis (use os valores do serviço MySQL):
   ```
   DB_HOST=[valor do MYSQL_HOST]
   DB_PORT=[valor do MYSQL_PORT]
   DB_USER=[valor do MYSQL_USER]
   DB_PASSWORD=[valor do MYSQL_PASSWORD]
   DB_NAME=[valor do MYSQL_DATABASE]
   PORT=3000
   ```

### 7. Deploy e Teste
1. O Railway fará o deploy automaticamente
2. Após o deploy, clique em **"Generate Domain"** para obter uma URL pública
3. Acesse a URL e teste o sistema

---

## 🔧 Configuração Local para Desenvolvimento

### 1. Instalar Dependências
```powershell
npm install
```

### 2. Criar Arquivo .env
Crie um arquivo `.env` na raiz do projeto com as credenciais do Railway:

```env
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=6379
DB_USER=root
DB_PASSWORD=sua_senha_do_railway
DB_NAME=railway
PORT=3000
```

### 3. Executar Localmente
```powershell
npm start
```

Acesse: http://localhost:3000

---

## 📊 Estrutura do Banco de Dados

O schema cria as seguintes tabelas:

1. **visitas** - Dados principais de cada visita
2. **criterio_c1** - Práticas produtivas sustentáveis (10 itens)
3. **criterio_c2** - Resultados percebidos (5 itens)
4. **criterio_c3** - Estrutura para agregação de valor (6 itens)
5. **criterio_c4** - Inserção em mercados (5 itens)
6. **barreiras** - Limitações observadas
7. **sintese** - Síntese do auditor

**Total de perguntas:** 32 campos/perguntas distribuídos em 7 etapas

---

## 🔌 API Endpoints Disponíveis

### GET /api/visitas
Retorna todas as visitas com todos os critérios

### GET /api/visitas/:id
Retorna uma visita específica

### POST /api/visitas
Cria uma nova visita
```json
{
  "id": "v_1234567890",
  "agricultor": "Nome",
  "municipio": "Cidade",
  "propriedade": "Nome da Propriedade",
  "dataVisita": "2024-11-17",
  "auditor": "Nome do Auditor",
  "tecnico": "Nome do Técnico",
  "c1": [...],
  "c2": [...],
  "c3": [...],
  "c4": [...],
  "barreiras": {...},
  "sintese": {...}
}
```

### DELETE /api/visitas/:id
Deleta uma visita específica

### DELETE /api/visitas
Deleta todas as visitas

---

## ⚠️ Solução de Problemas

### Erro de Conexão ao MySQL
- Verifique se as variáveis de ambiente estão corretas
- Confirme que o serviço MySQL está rodando no Railway
- Verifique os logs do Railway para mais detalhes

### Schema não foi criado
- Execute manualmente o arquivo `schema.sql` via cliente MySQL
- Verifique se tem permissões corretas no banco

### Aplicação não salva dados
- Abra o console do navegador (F12) para ver erros
- Verifique se a API está respondendo: `[sua-url]/api/visitas`
- Confirme que as variáveis de ambiente estão setadas no Railway

---

## 📝 Notas Importantes

1. O Railway oferece **500 horas gratuitas** por mês para começar
2. Após o período gratuito, há planos pagos a partir de $5/mês
3. Faça backup regular dos dados via exportação JSON/CSV
4. O schema usa `utf8mb4` para suportar caracteres especiais
5. As relações estão configuradas com `ON DELETE CASCADE` para manter integridade

---

## 🎯 Próximos Passos Sugeridos

1. [ ] Implementar autenticação de usuários
2. [ ] Adicionar fotos das visitas
3. [ ] Criar relatórios em PDF
4. [ ] Implementar busca avançada
5. [ ] Adicionar gráficos mais detalhados
6. [ ] Configurar backup automático

---

**Desenvolvido para Emater-RO - Sistema de Observação In Loco**
