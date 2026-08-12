const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/roms-manager';

async function connect() {
  await mongoose.connect(MONGO_URI);
  console.log(`[db] Conectado ao MongoDB: ${MONGO_URI}`);
}

mongoose.connection.on('disconnected', () => {
  console.warn('[db] MongoDB desconectado');
});

mongoose.connection.on('error', (err) => {
  console.error(`[db] Erro de conexão: ${err.message}`);
});

module.exports = { connect };
