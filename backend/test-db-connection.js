const mysql = require('mysql2/promise');

const passwords = ['', 'root', 'password', 'admin', '123456', 'mysql', 'User-120164360'];

async function testConnection(password) {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: password,
      port: 3306
    });
    
    const [rows] = await connection.execute('SELECT VERSION() as version');
    console.log(`✅ Sucesso com senha: "${password}"`);
    console.log(`MySQL Version: ${rows[0].version}`);
    
    // Tentar criar o banco de dados
    try {
      await connection.execute('CREATE DATABASE IF NOT EXISTS academia_db');
      console.log('✅ Banco de dados "academia_db" criado/verificado com sucesso');
    } catch (err) {
      console.log('❌ Erro ao criar banco de dados:', err.message);
    }
    
    await connection.end();
    return password;
  } catch (error) {
    console.log(`❌ Falha com senha: "${password}" - ${error.message}`);
    return null;
  }
}

async function findCorrectPassword() {
  console.log('🔍 Testando diferentes senhas para o MySQL...\n');
  
  for (const password of passwords) {
    const result = await testConnection(password);
    if (result !== null) {
      console.log(`\n🎉 Senha correta encontrada: "${result}"`);
      return result;
    }
  }
  
  console.log('\n❌ Nenhuma senha funcionou. Verifique a instalação do MySQL.');
  return null;
}

findCorrectPassword().then(password => {
  if (password !== null) {
    console.log('\n📝 Configure o arquivo .env com:');
    console.log(`DB_PASSWORD=${password}`);
  }
  process.exit(0);
}).catch(err => {
  console.error('Erro:', err);
  process.exit(1);
});