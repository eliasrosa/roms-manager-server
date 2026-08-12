/**
 * RomIndexer — fachada de conveniência para o use case SyncRoms.
 * Mantém compatibilidade com o boot em app.js.
 */
class RomIndexer {
  /**
   * @param {import('../../application/usecases/SyncRoms')} syncRoms
   */
  constructor(syncRoms) {
    this.syncRoms = syncRoms;
  }

  async indexAll() {
    return this.syncRoms.syncAll();
  }

  async indexPlatform(platform) {
    return this.syncRoms.syncPlatform(platform);
  }
}

module.exports = RomIndexer;
