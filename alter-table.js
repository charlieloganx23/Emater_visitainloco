const mysql = require('mysql2/promise');

async function alterTable() {
  const connection = await mysql.createConnection({
    host: 'tramway.proxy.rlwy.net',
    port: 33987,
    user: 'root',
    password: 'RPyVUvmDFhkPlHSPSXWyXOkaAdkttUas',
    database: 'railway'
  });

  console.log('✅ Conectado ao MySQL');

  try {
    console.log('🔧 Alterando coluna data_visita para aceitar NULL...');
    await connection.query('ALTER TABLE visitas MODIFY data_visita DATE NULL');
    console.log('✅ Coluna alterada com sucesso!');
  } catch (err) {
    console.error('❌ Erro:', err.message);
  }

  await connection.end();
}

alterTable();
