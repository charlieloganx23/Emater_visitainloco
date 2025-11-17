````markdown
# Observação In Loco – Emater-RO (Sistema Completo com MySQL)

Sistema completo para registro e análise de visitas in loco com:

- Formulário multi-etapas (7 etapas, 32 perguntas)
- Banco de dados MySQL hospedado no Railway
- API REST para gerenciamento de dados
- Tabela de entrevistas com espelho detalhado
- Painel com KPIs e gráficos analíticos
- Exportação de dados em JSON e CSV

---

## 📋 Perguntas do Formulário

O sistema possui **32 perguntas** distribuídas em **7 etapas**:

### Etapa 1: Identificação (6 campos)
- Nome do agricultor
- Município/Localidade
- Nome da propriedade
- Data da visita
- Auditor responsável
- Técnico acompanhante

### Etapa 2: C1 - Práticas Sustentáveis (10 perguntas Sim/Não/Parcial)
1. Orientação técnica ambiental da Emater
2. Práticas de conservação de solo e água
3. Uso de compostagem ou adubação orgânica
4. Manejo integrado de pragas
5. Sistema agroecológico/orgânico
6. Diversificação produtiva
7. Área de reserva legal/APP
8. Sementes crioulas/nativas
9. Captação e uso racional da água
10. Adequação sanitária animal

### Etapa 3: C3 - Agregação de Valor (6 perguntas Sim/Não/Parcial)
1. Estrutura de beneficiamento
2. Rótulos/embalagens/marca própria
3. Certificações
4. Apoio técnico da Emater
5. Equipamentos de agregação de valor
6. Acesso a linhas de fomento

### Etapa 4: C4 - Inserção em Mercados (5 perguntas + 1 descritiva)
1. Venda para PAA/PNAE
2. Feiras e cooperativas
3. Mercados locais/regionais
4. Canais de venda direta
5. Centrais de abastecimento
+ Descrição do tipo de comercialização

### Etapa 5: C2 - Resultados (5 perguntas Sim/Não/Parcial)
1. Melhoria na produtividade
2. Melhoria na renda familiar
3. Adoção de novas práticas
4. Melhoria nas condições de trabalho
5. Boas práticas replicáveis

### Etapa 6: Barreiras (4 perguntas descritivas)
1. Impedimentos a práticas sustentáveis
2. Gargalos para comercialização
3. Uso da infraestrutura de beneficiamento
4. Adequação da assistência técnica

### Etapa 7: Síntese (1 pergunta descritiva)
- Texto livre do auditor (até 15 linhas)

---

## 🚀 Deploy no Railway (Recomendado)

Veja o guia completo em **[RAILWAY_SETUP.md](RAILWAY_SETUP.md)**

### Resumo Rápido:
```bash
# 1. Criar projeto MySQL no Railway
# 2. Importar schema.sql
# 3. Deploy da aplicação via GitHub
# 4. Configurar variáveis de ambiente
# 5. Gerar domínio público
```

---

## 💻 Desenvolvimento Local

### 1. Pré-requisitos
- Node.js 14+
- Acesso ao MySQL do Railway (ou MySQL local)

### 2. Instalação
```bash
npm install
```

### 3. Configuração
Crie um arquivo `.env` com as credenciais do MySQL:
```env
DB_HOST=seu-host.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=railway
PORT=3000
```

### 4. Importar Schema
Execute o arquivo `schema.sql` no seu banco MySQL.

### 5. Executar
```bash
npm start
```

Acesse: http://localhost:3000

---

## 📂 Estrutura de Arquivos

```
observacao-in-loco-ux3/
├── server.js              # Servidor Express + API REST
├── db.js                  # Cliente de API (fetch)
├── ui.js                  # Lógica da interface
├── charts.js              # Geração de gráficos
├── index.html             # Interface principal
├── schema.sql             # Schema do banco MySQL
├── package.json           # Dependências
├── .env.example           # Exemplo de configuração
├── PERGUNTAS.md           # Lista completa de perguntas
├── RAILWAY_SETUP.md       # Guia de deploy
└── styles/
    ├── main.css
    ├── dashboard.css
    ├── form.css
    └── table.css
```

---

## 🔌 API Endpoints

### Visitas
- `GET /api/visitas` - Listar todas
- `GET /api/visitas/:id` - Buscar uma
- `POST /api/visitas` - Criar nova
- `DELETE /api/visitas/:id` - Deletar uma
- `DELETE /api/visitas` - Deletar todas

---

## 🎨 Funcionalidades

✅ Formulário multi-etapas com validação  
✅ 32 perguntas estruturadas em 7 etapas  
✅ Banco de dados MySQL persistente  
✅ API REST completa  
✅ Tabela com busca e filtros  
✅ Espelho detalhado de cada visita  
✅ Dashboard com KPIs e gráficos  
✅ Exportação JSON e CSV  
✅ Interface responsiva e moderna  
✅ Deploy fácil no Railway  

---

## 📊 Banco de Dados

O sistema utiliza **7 tabelas** relacionadas:
- `visitas` (dados principais)
- `criterio_c1` (práticas sustentáveis)
- `criterio_c2` (resultados)
- `criterio_c3` (agregação de valor)
- `criterio_c4` (mercados)
- `barreiras` (limitações)
- `sintese` (análise do auditor)

Todas com relacionamento `ON DELETE CASCADE` para integridade.

---

## 🛠️ Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript Vanilla
- **Backend:** Node.js + Express
- **Banco de Dados:** MySQL 8.0
- **Hospedagem:** Railway
- **APIs:** REST com JSON

---

## 📝 Licença

Desenvolvido para **Emater-RO** - Empresa de Assistência Técnica e Extensão Rural de Rondônia.

---

## 🆘 Suporte

Para problemas ou dúvidas:
1. Consulte [RAILWAY_SETUP.md](RAILWAY_SETUP.md)
2. Verifique os logs no Railway
3. Inspecione o console do navegador (F12)

---

**Versão:** 2.0 (com MySQL e Railway)  
**Última atualização:** Novembro 2025
````