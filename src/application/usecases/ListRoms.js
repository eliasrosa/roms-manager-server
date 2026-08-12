/**
 * Use case — listar ROMs com filtros opcionais.
 */
class ListRoms {
  /**
   * @param {import('../ports/RomRepository')} romRepository
   */
  constructor(romRepository) {
    this.romRepository = romRepository;
  }

  /**
   * @param {{ platform?: string, md5?: string, sha1?: string, crc32?: string }} filters
   * @returns {Promise<{ total: number, roms: import('../../domain/entities/Rom')[] }>}
   */
  async execute(filters = {}) {
    const normalized = {};
    if (filters.platform) normalized.platform = filters.platform;
    if (filters.md5)      normalized.md5  = filters.md5.toLowerCase();
    if (filters.sha1)     normalized.sha1 = filters.sha1.toLowerCase();
    if (filters.crc32)    normalized.crc32 = filters.crc32.toUpperCase();

    const roms = await this.romRepository.findAll(normalized);
    return { total: roms.length, roms };
  }
}

module.exports = ListRoms;
