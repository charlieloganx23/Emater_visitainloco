const mysql = require('mysql2/promise');
const fs = require('fs');

async function importSchema() {
  const connection = await mysql.createConnection({
    host: 'tramway.proxy.rlwy.net',
    port: 33987,
    user: 'root',
    password: 'RPyVUvmDFhkPlHSPSXWyXOkaAdkttUas',
    database: 'railway',
    multipleStatements: true
  });

  console.log('✅ Conectado ao MySQL do Railway');

  const schema = fs.readFileSync('schema.sql', 'utf8');
  
  console.log('📥 Importando schema...');
  await connection.query(schema);
  
  console.log('✅ Schema importado com sucesso!');
  
  // Verificar as tabelas criadas
  const [tables] = await connection.query('SHOW TABLES');
  console.log('\n📊 Tabelas criadas:');
  tables.forEach(table => {
    console.log(`  - ${Object.values(table)[0]}`);
  });

  await connection.end();
}

importSchema().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
