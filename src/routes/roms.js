const express = require('express');
const path = require('path');
const fs = require('fs');
const Rom = require('../models/Rom');
const { indexAll, indexPlatform } = require('../services/indexer');

const router = express.Router();
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');

// GET /roms?platform=gba&md5=...&sha1=...&crc32=...
router.get('/', async (req, res) => {
  const { platform, md5, sha1, crc32 } = req.query;

  const filter = {};
  if (platform) filter.platform = platform;
  if (md5)      filter.md5 = md5.toLowerCase();
  if (sha1)     filter.sha1 = sha1.toLowerCase();
  if (crc32)    filter.crc32 = crc32.toUpperCase();

  const roms = await Rom.find(filter).sort({ platform: 1, filename: 1 }).lean();

  res.json({ total: roms.length, roms });
});

// POST /roms/sync?platform=gba  (platform opcional — sem ele, sincroniza tudo)
router.post('/sync', async (req, res) => {
  const { platform } = req.query;

  const results = platform ? [await indexPlatform(platform)] : await indexAll();

  res.json({ results });
});

// GET /roms/:platform/manifest — manifest leve para sync
router.get('/:platform/manifest', async (req, res) => {
  const { platform } = req.params;

  const roms = await Rom.find({ platform }, { filename: 1, size: 1, crc32: 1, _id: 0 })
    .sort({ filename: 1 })
    .lean();

  res.json({ platform, total: roms.length, roms });
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
