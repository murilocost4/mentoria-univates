require('dotenv').config();
const { initDatabase } = require('../src/config/database');

initDatabase()
  .then(() => {
    console.log('Banco inicializado com sucesso.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Erro ao inicializar banco:', err);
    process.exit(1);
  });
