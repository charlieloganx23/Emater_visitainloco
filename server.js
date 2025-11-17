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
    console.log('📥 Verificando/criando estrutura do banco de dados...');
    
    // Ler e executar schema-clean.sql (usa CREATE TABLE IF NOT EXISTS)
    const schema = fs.readFileSync('schema-clean.sql', 'utf8');
    console.log(`📄 Schema lido: ${schema.length} caracteres`);
    
    // Remover comentários e dividir por ponto-e-vírgula
    const cleanedSchema = schema
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');
    
    const statements = cleanedSchema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`📝 ${statements.length} statements encontrados`);
    
    let executedCount = 0;
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.query(statement);
          executedCount++;
        } catch (err) {
          console.error('⚠️  Erro ao executar statement:', err.message);
          console.error('Statement:', statement.substring(0, 100) + '...');
        }
      }
    }
    
    console.log(`✅ ${executedCount} statements executados com sucesso`);
    
    // Verificar se as tabelas foram criadas
    const [tables] = await connection.query("SHOW TABLES");
    console.log(`✅ Banco de dados pronto com ${tables.length} tabelas`);
    tables.forEach(t => console.log(`  - ${Object.values(t)[0]}`));
    
    console.log('✅ Conectado ao MySQL no Railway');
    connection.release();
  } catch (err) {
    console.error('❌ Erro ao inicializar banco de dados:', err.message);
    connection.release();
    throw err;
  }
}

// Rotas de API (serão executadas após inicialização do banco)

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
    
    // Inserir visita principal (converter string vazia para NULL)
    await connection.query(
      'INSERT INTO visitas (id, agricultor, municipio, propriedade, data_visita, auditor, tecnico) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, agricultor, municipio, propriedade, dataVisita || null, auditor, tecnico]
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

// POST sincronização em batch (offline → online)
app.post("/api/visitas/sync", async (req, res) => {
  const { visitas } = req.body;
  
  if (!Array.isArray(visitas) || visitas.length === 0) {
    return res.status(400).json({ error: 'Array de visitas inválido' });
  }
  
  console.log(`🔄 Sincronização em batch: ${visitas.length} visita(s)`);
  
  const results = [];
  const connection = await pool.getConnection();
  
  try {
    for (const visitaData of visitas) {
      try {
        // Verificar se já existe
        const [existing] = await connection.query('SELECT id FROM visitas WHERE id = ?', [visitaData.id]);
        
        if (existing.length > 0) {
          // Já existe, pular
          results.push({
            id: visitaData.id,
            status: 'skipped',
            message: 'Visita já existe no banco'
          });
          continue;
        }
        
        // Inserir visita
        await connection.query(
          `INSERT INTO visitas (id, agricultor, municipio, propriedade, data_visita, auditor, tecnico) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            visitaData.id,
            visitaData.agricultor,
            visitaData.municipio,
            visitaData.propriedade,
            visitaData.data_visita || null,
            visitaData.auditor,
            visitaData.tecnico
          ]
        );
        
        // Inserir critérios C1, C2, C3, C4
        if (Array.isArray(visitaData.c1)) {
          for (const item of visitaData.c1) {
            await connection.query(
              `INSERT INTO criterio_c1 (visita_id, item_index, item_label, status, observacao) 
               VALUES (?, ?, ?, ?, ?)`,
              [visitaData.id, item.item_index, item.item_label, item.status, item.observacao]
            );
          }
        }
        
        if (Array.isArray(visitaData.c2)) {
          for (const item of visitaData.c2) {
            await connection.query(
              `INSERT INTO criterio_c2 (visita_id, item_index, item_label, status, observacao) 
               VALUES (?, ?, ?, ?, ?)`,
              [visitaData.id, item.item_index, item.item_label, item.status, item.observacao]
            );
          }
        }
        
        if (Array.isArray(visitaData.c3)) {
          for (const item of visitaData.c3) {
            await connection.query(
              `INSERT INTO criterio_c3 (visita_id, item_index, item_label, status, observacao) 
               VALUES (?, ?, ?, ?, ?)`,
              [visitaData.id, item.item_index, item.item_label, item.status, item.observacao]
            );
          }
        }
        
        if (Array.isArray(visitaData.c4)) {
          for (const item of visitaData.c4) {
            await connection.query(
              `INSERT INTO criterio_c4 (visita_id, item_index, item_label, status, observacao, descricao_comercializacao) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [visitaData.id, item.item_index, item.item_label, item.status, item.observacao, item.descricao_comercializacao || null]
            );
          }
        }
        
        // Barreiras
        if (visitaData.barreiras) {
          const b = visitaData.barreiras;
          await connection.query(
            `INSERT INTO barreiras (visita_id, impedimentos_praticas_sustentaveis, gargalos_comercializacao, 
             infraestrutura_beneficiamento, adequacao_assistencia_tecnica) 
             VALUES (?, ?, ?, ?, ?)`,
            [visitaData.id, b.impedimentos_praticas_sustentaveis, b.gargalos_comercializacao, 
             b.infraestrutura_beneficiamento, b.adequacao_assistencia_tecnica]
          );
        }
        
        // Síntese
        if (visitaData.sintese && visitaData.sintese.texto_sintese) {
          await connection.query(
            `INSERT INTO sintese (visita_id, texto_sintese) VALUES (?, ?)`,
            [visitaData.id, visitaData.sintese.texto_sintese]
          );
        }
        
        results.push({
          id: visitaData.id,
          status: 'success',
          message: 'Visita sincronizada com sucesso'
        });
        
      } catch (itemError) {
        console.error(`Erro ao sincronizar visita ${visitaData.id}:`, itemError);
        results.push({
          id: visitaData.id,
          status: 'error',
          message: itemError.message
        });
      }
    }
    
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const skippedCount = results.filter(r => r.status === 'skipped').length;
    
    console.log(`✅ Sync completo: ${successCount} sucesso, ${errorCount} erros, ${skippedCount} pulados`);
    
    res.json({
      message: 'Sincronização em batch concluída',
      total: visitas.length,
      success: successCount,
      errors: errorCount,
      skipped: skippedCount,
      results: results
    });
    
  } catch (error) {
    console.error('Erro na sincronização em batch:', error);
    res.status(500).json({ error: 'Erro na sincronização em batch', details: error.message });
  } finally {
    connection.release();
  }
});

// Rota principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Inicializar banco de dados e depois iniciar o servidor
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log("🚀 Servidor observacao-in-loco ouvindo na porta", PORT);
    });
  } catch (err) {
    console.error('❌ Falha crítica ao inicializar:', err);
    process.exit(1);
  }
}

startServer();
