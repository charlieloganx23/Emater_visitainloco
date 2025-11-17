const mysql = require('mysql2/promise');
const fs = require('fs');

async function backupDatabase() {
  const connection = await mysql.createConnection({
    host: 'tramway.proxy.rlwy.net',
    port: 33987,
    user: 'root',
    password: 'RPyVUvmDFhkPlHSPSXWyXOkaAdkttUas',
    database: 'railway'
  });

  console.log('✅ Conectado ao MySQL Railway');
  console.log('📦 Exportando dados...\n');

  const backup = {
    timestamp: new Date().toISOString(),
    version: 'v1.0.0',
    tables: {}
  };

  // Exportar visitas
  const [visitas] = await connection.query('SELECT * FROM visitas');
  backup.tables.visitas = visitas;
  console.log(`  ✅ visitas: ${visitas.length} registros`);

  // Exportar critérios
  const [c1] = await connection.query('SELECT * FROM criterio_c1');
  backup.tables.criterio_c1 = c1;
  console.log(`  ✅ criterio_c1: ${c1.length} registros`);

  const [c2] = await connection.query('SELECT * FROM criterio_c2');
  backup.tables.criterio_c2 = c2;
  console.log(`  ✅ criterio_c2: ${c2.length} registros`);

  const [c3] = await connection.query('SELECT * FROM criterio_c3');
  backup.tables.criterio_c3 = c3;
  console.log(`  ✅ criterio_c3: ${c3.length} registros`);

  const [c4] = await connection.query('SELECT * FROM criterio_c4');
  backup.tables.criterio_c4 = c4;
  console.log(`  ✅ criterio_c4: ${c4.length} registros`);

  const [barreiras] = await connection.query('SELECT * FROM barreiras');
  backup.tables.barreiras = barreiras;
  console.log(`  ✅ barreiras: ${barreiras.length} registros`);

  const [sintese] = await connection.query('SELECT * FROM sintese');
  backup.tables.sintese = sintese;
  console.log(`  ✅ sintese: ${sintese.length} registros`);

  await connection.end();

  // Salvar backup
  const filename = `backup-v1.0.0-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(backup, null, 2));

  console.log(`\n✅ Backup salvo em: ${filename}`);
  console.log(`📊 Total de registros: ${visitas.length} visitas`);
}

backupDatabase().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
