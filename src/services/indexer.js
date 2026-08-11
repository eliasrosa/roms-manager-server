const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { crc32 } = require('crc');
const Rom = require('../models/Rom');

const PLATFORMS = ['gba', 'gb', 'gbc', 'n64', 'nes', 'snes', 'genesis', 'game-gear', 'master-system', 'fbneo'];

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');

function computeHashes(filepath) {
  return new Promise((resolve, reject) => {
    const md5 = crypto.createHash('md5');
    const sha1 = crypto.createHash('sha1');
    let crc = 0;
    const stream = fs.createReadStream(filepath);
    stream.on('data', (chunk) => {
      md5.update(chunk);
      sha1.update(chunk);
      crc = crc32(chunk, crc);
    });
    stream.on('end', () => resolve({
      md5: md5.digest('hex'),
      sha1: sha1.digest('hex'),
      crc32: crc.toString(16).padStart(8, '0').toUpperCase(),
    }));
    stream.on('error', reject);
  });
}

async function indexPlatform(platform) {
  const romsDir = path.join(DATA_DIR, platform, 'roms');

  if (!fs.existsSync(romsDir)) {
    console.log(`[indexer] ${platform}: diretório não encontrado, pulando`);
    return { platform, indexed: 0, skipped: 0 };
  }

  const files = fs.readdirSync(romsDir).filter((f) => {
    const name = f.toLowerCase();
    return !name.startsWith('.') && !name.startsWith('._');
  });

  let indexed = 0;
  let skipped = 0;

  for (const filename of files) {
    const filepath = path.join(romsDir, filename);
    const stat = fs.statSync(filepath);

    if (!stat.isFile()) continue;

    try {
      // Busca registro existente
      const existing = await Rom.findOne({ platform, filename }).lean();

      // Skip se size e modified não mudaram
      if (
        existing &&
        existing.size === stat.size &&
        new Date(existing.modified).getTime() === stat.mtime.getTime()
      ) {
        skipped++;
        continue;
      }

      const { md5, sha1, crc32: crc32Hash } = await computeHashes(filepath);

      await Rom.findOneAndUpdate(
        { platform, filename },
        {
          platform,
          filename,
          size: stat.size,
          md5,
          sha1,
          crc32: crc32Hash,
          modified: stat.mtime,
        },
        { upsert: true, new: true }
      );

      indexed++;
    } catch (err) {
      console.warn(`[indexer] Erro ao indexar ${filename}: ${err.message}`);
    }
  }

  console.log(`[indexer] ${platform}: ${indexed} indexadas, ${skipped} sem alteração`);
  return { platform, indexed, skipped };
}

async function indexAll() {
  console.log('[indexer] Iniciando indexação...');
  const results = [];

  for (const platform of PLATFORMS) {
    const result = await indexPlatform(platform);
    results.push(result);
  }

  const total = results.reduce((acc, r) => acc + r.indexed, 0);
  const totalSkipped = results.reduce((acc, r) => acc + r.skipped, 0);
  console.log(`[indexer] Concluído: ${total} indexadas, ${totalSkipped} sem alteração`);
  return results;
}

module.exports = { indexAll, indexPlatform };
