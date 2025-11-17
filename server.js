require('dotenv').config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Configuração do pool de conexão MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Função para inicializar banco de dados
async function initializeDatabase() {
  const fs = require('fs');
  const connection = await pool.getConnection();
  
  try {
    // Verificar se as tabelas existem
    const [tables] = await connection.query("SHOW TABLES LIKE 'visitas'");
    
    if (tables.length === 0) {
      console.log('📥 Criando estrutura do banco de dados...');
      
      // Ler e executar schema.sql
      const schema = fs.readFileSync('schema.sql', 'utf8');
      await connection.query(schema);
      
      console.log('✅ Banco de dados inicializado com sucesso');
    } else {
      console.log('✅ Banco de dados já inicializado');
    }
    
    console.log('✅ Conectado ao MySQL no Railway');
    connection.release();
  } catch (err) {
    console.error('❌ Erro ao inicializar banco de dados:', err.message);
    connection.release();
    throw err;
  }
}

// Inicializar banco e depois continuar
initializeDatabase().catch(err => {
  console.error('❌ Falha crítica ao inicializar:', err);
  process.exit(1);
});

// Rotas de API

// GET todas as visitas
app.get("/api/visitas", async (req, res) => {
  try {
    const [visitas] = await pool.query('SELECT * FROM visitas ORDER BY data_visita DESC');
    
    // Para cada visita, buscar os critérios
    for (let visita of visitas) {
      const [c1] = await pool.query('SELECT * FROM criterio_c1 WHERE visita_id = ?', [visita.id]);
      const [c2] = await pool.query('SELECT * FROM criterio_c2 WHERE visita_id = ?', [visita.id]);
      const [c3] = await pool.query('SELECT * FROM criterio_c3 WHERE visita_id = ?', [visita.id]);
      const [c4] = await pool.query('SELECT * FROM criterio_c4 WHERE visita_id = ?', [visita.id]);
      const [barreiras] = await pool.query('SELECT * FROM barreiras WHERE visita_id = ?', [visita.id]);
      const [sintese] = await pool.query('SELECT * FROM sintese WHERE visita_id = ?', [visita.id]);
      
      visita.c1 = c1;
      visita.c2 = c2;
      visita.c3 = c3;
      visita.c4 = c4;
      visita.barreiras = barreiras[0] || {};
      visita.sintese = sintese[0] || {};
    }
    
    res.json(visitas);
  } catch (error) {
    console.error('Erro ao buscar visitas:', error);
    res.status(500).json({ error: 'Erro ao buscar visitas' });
  }
});

// GET uma visita específica
app.get("/api/visitas/:id", async (req, res) => {
  try {
    const [visitas] = await pool.query('SELECT * FROM visitas WHERE id = ?', [req.params.id]);
    
    if (visitas.length === 0) {
      return res.status(404).json({ error: 'Visita não encontrada' });
    }
    
    const visita = visitas[0];
    const [c1] = await pool.query('SELECT * FROM criterio_c1 WHERE visita_id = ?', [visita.id]);
    const [c2] = await pool.query('SELECT * FROM criterio_c2 WHERE visita_id = ?', [visita.id]);
    const [c3] = await pool.query('SELECT * FROM criterio_c3 WHERE visita_id = ?', [visita.id]);
    const [c4] = await pool.query('SELECT * FROM criterio_c4 WHERE visita_id = ?', [visita.id]);
    const [barreiras] = await pool.query('SELECT * FROM barreiras WHERE visita_id = ?', [visita.id]);
    const [sintese] = await pool.query('SELECT * FROM sintese WHERE visita_id = ?', [visita.id]);
    
    visita.c1 = c1;
    visita.c2 = c2;
    visita.c3 = c3;
    visita.c4 = c4;
    visita.barreiras = barreiras[0] || {};
    visita.sintese = sintese[0] || {};
    
    res.json(visita);
  } catch (error) {
    console.error('Erro ao buscar visita:', error);
    res.status(500).json({ error: 'Erro ao buscar visita' });
  }
});

// POST criar nova visita
app.post("/api/visitas", async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id, agricultor, municipio, propriedade, dataVisita, auditor, tecnico, c1, c2, c3, c4, barreiras, sintese } = req.body;
    
    // Inserir visita principal
    await connection.query(
      'INSERT INTO visitas (id, agricultor, municipio, propriedade, data_visita, auditor, tecnico) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, agricultor, municipio, propriedade, dataVisita, auditor, tecnico]
    );
    
    // Inserir critérios C1
    if (c1 && Array.isArray(c1)) {
      for (let item of c1) {
        await connection.query(
          'INSERT INTO criterio_c1 (visita_id, item_index, item_label, status, observacao) VALUES (?, ?, ?, ?, ?)',
          [id, item.item_index, item.item_label, item.status, item.observacao]
        );
      }
    }
    
    // Inserir critérios C2
    if (c2 && Array.isArray(c2)) {
      for (let item of c2) {
        await connection.query(
          'INSERT INTO criterio_c2 (visita_id, item_index, item_label, status, observacao) VALUES (?, ?, ?, ?, ?)',
          [id, item.item_index, item.item_label, item.status, item.observacao]
        );
      }
    }
    
    // Inserir critérios C3
    if (c3 && Array.isArray(c3)) {
      for (let item of c3) {
        await connection.query(
          'INSERT INTO criterio_c3 (visita_id, item_index, item_label, status, observacao) VALUES (?, ?, ?, ?, ?)',
          [id, item.item_index, item.item_label, item.status, item.observacao]
        );
      }
    }
    
    // Inserir critérios C4
    if (c4 && Array.isArray(c4)) {
      for (let item of c4) {
        await connection.query(
          'INSERT INTO criterio_c4 (visita_id, item_index, item_label, status, observacao, descricao_comercializacao) VALUES (?, ?, ?, ?, ?, ?)',
          [id, item.item_index, item.item_label, item.status, item.observacao, item.descricao_comercializacao]
        );
      }
    }
    
    // Inserir barreiras
    if (barreiras) {
      await connection.query(
        'INSERT INTO barreiras (visita_id, impedimentos_praticas_sustentaveis, gargalos_comercializacao, infraestrutura_beneficiamento, adequacao_assistencia_tecnica) VALUES (?, ?, ?, ?, ?)',
        [id, barreiras.b1, barreiras.b2, barreiras.b3, barreiras.b4]
      );
    }
    
    // Inserir síntese
    if (sintese) {
      await connection.query(
        'INSERT INTO sintese (visita_id, texto_sintese) VALUES (?, ?)',
        [id, sintese.texto]
      );
    }
    
    await connection.commit();
    res.status(201).json({ message: 'Visita criada com sucesso', id });
    
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao criar visita:', error);
    res.status(500).json({ error: 'Erro ao criar visita' });
  } finally {
    connection.release();
  }
});

// DELETE uma visita
app.delete("/api/visitas/:id", async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM visitas WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Visita não encontrada' });
    }
    
    res.json({ message: 'Visita deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar visita:', error);
    res.status(500).json({ error: 'Erro ao deletar visita' });
  }
});

// DELETE todas as visitas
app.delete("/api/visitas", async (req, res) => {
  try {
    await pool.query('DELETE FROM visitas');
    res.json({ message: 'Todas as visitas foram deletadas' });
  } catch (error) {
    console.error('Erro ao deletar visitas:', error);
    res.status(500).json({ error: 'Erro ao deletar visitas' });
  }
});

// Rota principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log("🚀 Servidor observacao-in-loco ouvindo na porta", PORT);
});
