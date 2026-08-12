const { PLATFORM_VALUES } = require('../../domain/enums/Platform');
const Rom = require('../../domain/entities/Rom');

/**
 * Use case — indexar ROMs do disco para o banco.
 */
class SyncRoms {
  /**
   * @param {import('../ports/RomRepository')} romRepository
   * @param {import('../ports/FileStorage')} fileStorage
   */
  constructor(romRepository, fileStorage) {
    this.romRepository = romRepository;
    this.fileStorage   = fileStorage;
  }

  /**
   * Sincroniza uma plataforma específica.
   * @param {string} platform
   * @returns {Promise<{ platform: string, indexed: number, skipped: number }>}
   */
  async syncPlatform(platform) {
    let indexed = 0;
    let skipped = 0;

    let files;
    try {
      files = await this.fileStorage.listFiles(platform);
    } catch {
      console.log(`[sync] ${platform}: diretório não encontrado, pulando`);
      return { platform, indexed: 0, skipped: 0 };
    }

    for (const filename of files) {
      try {
        const meta = await this.fileStorage.getFileMeta(platform, filename);
        const existing = await this.romRepository.findMeta(platform, filename);

        // Skip se size e modified não mudaram
        if (
          existing &&
          existing.size === meta.size &&
          new Date(existing.modified).getTime() === meta.modified.getTime()
        ) {
          skipped++;
          continue;
        }

        const hashes = await this.fileStorage.computeHashes(platform, filename);

        const rom = new Rom({
          platform,
          filename,
          size:     meta.size,
          modified: meta.modified,
          ...hashes,
        });

        await this.romRepository.upsert(rom);
        indexed++;
      } catch (err) {
        console.warn(`[sync] Erro ao indexar ${filename}: ${err.message}`);
      }
    }

    console.log(`[sync] ${platform}: ${indexed} indexadas, ${skipped} sem alteração`);
    return { platform, indexed, skipped };
  }

  /**
   * Sincroniza todas as plataformas.
   * @returns {Promise<{ platform: string, indexed: number, skipped: number }[]>}
   */
  async syncAll() {
    console.log('[sync] Iniciando indexação...');
    const results = [];

    for (const platform of PLATFORM_VALUES) {
      results.push(await this.syncPlatform(platform));
    }

    const total        = results.reduce((acc, r) => acc + r.indexed, 0);
    const totalSkipped = results.reduce((acc, r) => acc + r.skipped, 0);
    console.log(`[sync] Concluído: ${total} indexadas, ${totalSkipped} sem alteração`);
    return results;
  }
}

module.exports = SyncRoms;
