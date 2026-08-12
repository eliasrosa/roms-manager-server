const { NotFoundError } = require('../../../application/usecases/DownloadRom');

/**
 * Controller HTTP — traduz req/res para chamadas aos use cases.
 */
class RomController {
  /**
   * @param {object} usecases
   * @param {import('../../../application/usecases/ListRoms')}    usecases.listRoms
   * @param {import('../../../application/usecases/GetManifest')} usecases.getManifest
   * @param {import('../../../application/usecases/DownloadRom').DownloadRom} usecases.downloadRom
   * @param {import('../../../application/usecases/SyncRoms')}    usecases.syncRoms
   */
  constructor({ listRoms, getManifest, downloadRom, syncRoms }) {
    this.listRoms    = listRoms;
    this.getManifest = getManifest;
    this.downloadRom = downloadRom;
    this.syncRoms    = syncRoms;
  }

  async list(req, res) {
    const { platform, md5, sha1, crc32 } = req.query;
    const result = await this.listRoms.execute({ platform, md5, sha1, crc32 });
    res.json(result);
  }

  async manifest(req, res) {
    const { platform } = req.params;
    const result = await this.getManifest.execute(platform);
    res.json(result);
  }

  async download(req, res) {
    const { platform, filename } = req.params;
    try {
      const filepath = await this.downloadRom.execute(platform, filename);
      res.download(filepath);
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ error: err.message });
      }
      throw err;
    }
  }

  async sync(req, res) {
    const { platform } = req.query;
    const results = platform
      ? [await this.syncRoms.syncPlatform(platform)]
      : await this.syncRoms.syncAll();
    res.json({ results });
  }
}

module.exports = RomController;
