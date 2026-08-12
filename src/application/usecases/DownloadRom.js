class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * Use case — resolver o path de uma ROM para download.
 */
class DownloadRom {
  /**
   * @param {import('../ports/RomRepository')} romRepository
   * @param {import('../ports/FileStorage')} fileStorage
   */
  constructor(romRepository, fileStorage) {
    this.romRepository = romRepository;
    this.fileStorage   = fileStorage;
  }

  /**
   * @param {string} platform
   * @param {string} filename
   * @returns {Promise<string>} path absoluto do arquivo
   * @throws {NotFoundError}
   */
  async execute(platform, filename) {
    const rom = await this.romRepository.findOne(platform, filename);
    if (!rom) throw new NotFoundError('ROM não encontrada');

    if (!this.fileStorage.fileExists(platform, filename)) {
      throw new NotFoundError('Arquivo não encontrado no disco');
    }

    return this.fileStorage.getFilePath(platform, filename);
  }
}

module.exports = { DownloadRom, NotFoundError };
