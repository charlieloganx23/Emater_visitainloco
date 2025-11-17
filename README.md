# Observação In Loco – Emater-RO (UX aprimorada)

Aplicação estática com:

- Formulário multi-etapas para registro da visita
- Tabela de entrevistas com espelho detalhado ao clicar
- Painel com KPIs e gráficos simples (HTML/CSS, sem dependência de CDN)
- Armazenamento local em `localStorage`

## 1. Uso com Simple HTTP Server (offline)

```bash
python -m http.server 8000
```

Depois, acesse:

- http://localhost:8000

## 2. Uso com GitHub Pages

- Suba todos os arquivos deste diretório para um repositório.
- Nas configurações do GitHub, habilite **Pages** apontando para a branch com estes arquivos.
- A aplicação é totalmente estática.

## 3. Uso no Railway

```bash
npm install
npm start
```

- Aponte o Railway para rodar `npm start`.
- O servidor Express (`server.js`) servirá `index.html` e os assets.