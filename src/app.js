require('dotenv').config();

const express = require('express');
const { connect } = require('./db');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

// Inicialização
async function start() {
  await connect();

  app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║   ROMs Manager NS - Servidor de Sync        ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║  Porta: ${String(PORT).padEnd(36)}║`);
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');
    console.log(`  GET http://0.0.0.0:${PORT}/health`);
    console.log('');
  });
}

start().catch((err) => {
  console.error('[fatal] Falha ao iniciar:', err.message);
  process.exit(1);
});
