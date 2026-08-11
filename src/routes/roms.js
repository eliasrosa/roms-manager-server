const express = require('express');
const path = require('path');
const fs = require('fs');
const Rom = require('../models/Rom');
const { indexAll, indexPlatform } = require('../services/indexer');

const router = express.Router();
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');

// GET /roms?platform=gba
router.get('/', async (req, res) => {
  const { platform } = req.query;

  const filter = platform ? { platform } : {};
  const roms = await Rom.find(filter).sort({ platform: 1, filename: 1 }).lean();

  res.json({ total: roms.length, roms });
});

// POST /roms/sync?platform=gba  (platform opcional — sem ele, sincroniza tudo)
router.post('/sync', async (req, res) => {
  const { platform } = req.query;

  const results = platform ? [await indexPlatform(platform)] : await indexAll();

  res.json({ results });
});

// GET /roms/:platform/:filename — download direto
router.get('/:platform/:filename', async (req, res) => {
  const { platform, filename } = req.params;

  const rom = await Rom.findOne({ platform, filename }).lean();
  if (!rom) return res.status(404).json({ error: 'ROM não encontrada' });

  const filepath = path.join(DATA_DIR, platform, 'roms', filename);
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'Arquivo não encontrado no disco' });
  }

  res.download(filepath);
});

module.exports = router;
