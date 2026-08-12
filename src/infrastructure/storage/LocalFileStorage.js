const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { crc32 } = require('crc');
const FileStorage = require('../../application/ports/FileStorage');

/**
 * Implementação do FileStorage usando o filesystem local.
 */
class LocalFileStorage extends FileStorage {
  /**
   * @param {string} dataDir — diretório base (ex: /data)
   */
  constructor(dataDir) {
    super();
    this.dataDir = dataDir;
  }

  _romsDir(platform) {
    return path.join(this.dataDir, platform, 'roms');
  }

  _filePath(platform, filename) {
    return path.join(this._romsDir(platform), filename);
  }

  async listFiles(platform) {
    const dir = this._romsDir(platform);
    if (!fs.existsSync(dir)) throw new Error(`Diretório não encontrado: ${dir}`);

    return fs.readdirSync(dir).filter((f) => {
      const name = f.toLowerCase();
      return !name.startsWith('.') && !name.startsWith('._');
    });
  }

  async getFileMeta(platform, filename) {
    const stat = fs.statSync(this._filePath(platform, filename));
    return { size: stat.size, modified: stat.mtime };
  }

  getFilePath(platform, filename) {
    return this._filePath(platform, filename);
  }

  fileExists(platform, filename) {
    return fs.existsSync(this._filePath(platform, filename));
  }

  async computeHashes(platform, filename) {
    return new Promise((resolve, reject) => {
      const md5  = crypto.createHash('md5');
      const sha1 = crypto.createHash('sha1');
      let crc = 0;

      const stream = fs.createReadStream(this._filePath(platform, filename));
      stream.on('data', (chunk) => {
        md5.update(chunk);
        sha1.update(chunk);
        crc = crc32(chunk, crc);
      });
      stream.on('end', () => resolve({
        md5:   md5.digest('hex'),
        sha1:  sha1.digest('hex'),
        crc32: crc.toString(16).padStart(8, '0').toUpperCase(),
      }));
      stream.on('error', reject);
    });
  }
}

module.exports = LocalFileStorage;
