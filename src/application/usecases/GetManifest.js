/**
 * Use case — retornar manifest leve de uma plataforma para sync no Switch.
 */
class GetManifest {
  /**
   * @param {import('../ports/RomRepository')} romRepository
   */
  constructor(romRepository) {
    this.romRepository = romRepository;
  }

  /**
   * @param {string} platform
   * @returns {Promise<{ platform: string, total: number, roms: object[] }>}
   */
  async execute(platform) {
    const roms = await this.romRepository.findAll({ platform });
    return {
      platform,
      total: roms.length,
      roms: roms.map((rom) => rom.toManifestEntry()),
    };
  }
}

module.exports = GetManifest;
