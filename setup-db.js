const mysql = require('mysql2/promise');
const fs = require('fs');

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'railway',
    multipleStatements: true
  });

  console.log('✅ Conectado ao MySQL');
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   Database: ${process.env.DB_NAME}`);

  const schema = fs.readFileSync('schema.sql', 'utf8');
  
  console.log('\n📥 Importando schema...');
  await connection.query(schema);
  
  console.log('✅ Schema importado com sucesso!');
  
  const [tables] = await connection.query('SHOW TABLES');
  console.log('\n📊 Tabelas criadas:');
  tables.forEach(table => {
    console.log(`  - ${Object.values(table)[0]}`);
  });

  await connection.end();
}

setupDatabase().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
