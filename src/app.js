require('dotenv').config();

const path = require('path');
const express = require('express');

// Infrastructure
const { connect }           = require('./infrastructure/db/connection');
const MongoRomRepository    = require('./infrastructure/repositories/MongoRomRepository');
const LocalFileStorage      = require('./infrastructure/storage/LocalFileStorage');

// Use cases
const ListRoms              = require('./application/usecases/ListRoms');
const { DownloadRom }       = require('./application/usecases/DownloadRom');
const SyncRoms              = require('./application/usecases/SyncRoms');

// Interfaces
const RomController         = require('./interfaces/http/controllers/RomController');
const createRomRouter       = require('./interfaces/http/routes/roms');

const PORT     = process.env.PORT     || 8080;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../data');

async function start() {
  // Conexão com o banco
  await connect();

  // Injeção de dependências
  const romRepository = new MongoRomRepository();
  const fileStorage   = new LocalFileStorage(DATA_DIR);

  const syncRoms    = new SyncRoms(romRepository, fileStorage);
  const listRoms    = new ListRoms(romRepository);
  const downloadRom = new DownloadRom(romRepository, fileStorage);

  const controller  = new RomController({ listRoms, downloadRom, syncRoms });
  const romRouter   = createRomRouter(controller);

  // Indexação inicial
  await syncRoms.syncAll();

  // Express
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  });

  // Error handler global
  app.use((err, req, res, _next) => {
    console.error('[error]', err.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  });

  app.get('/', (req, res) => res.json({ status: 'ok', time: Date.now() }));

  app.use('/roms', romRouter);

  app.get('/health', (req, res) => res.json({ status: 'ok', time: Date.now() }));

  app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║   ROMs Manager NS - Servidor de Sync        ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║  Porta: ${String(PORT).padEnd(36)}║`);
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');
    console.log(`  GET  http://0.0.0.0:${PORT}/health`);
    console.log(`  GET  http://0.0.0.0:${PORT}/roms?platform=gba`);
    console.log(`  GET  http://0.0.0.0:${PORT}/roms/:platform/:filename`);
    console.log(`  POST http://0.0.0.0:${PORT}/roms/sync`);
    console.log('');
  });
}

start().catch((err) => {
  console.error('[fatal] Falha ao iniciar:', err.message);
  process.exit(1);
});
