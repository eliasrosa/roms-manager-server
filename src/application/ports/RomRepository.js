/**
 * Port — contrato do repositório de ROMs.
 * A infraestrutura deve implementar todos os métodos abaixo.
 */
class RomRepository {
  /**
   * Busca ROMs com filtros opcionais.
   * @param {{ platform?: string, md5?: string, sha1?: string, crc32?: string }} filters
   * @returns {Promise<import('../../domain/entities/Rom')[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async findAll(filters) { throw new Error('Not implemented'); }

  /**
   * Busca uma ROM pelo par platform + filename.
   * @param {string} platform
   * @param {string} filename
   * @returns {Promise<import('../../domain/entities/Rom') | null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findOne(platform, filename) { throw new Error('Not implemented'); }

  /**
   * Busca ROM existente checando apenas size e modified (usado no skip de indexação).
   * @param {string} platform
   * @param {string} filename
   * @returns {Promise<{ size: number, modified: Date } | null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findMeta(platform, filename) { throw new Error('Not implemented'); }

  /**
   * Insere ou atualiza uma ROM.
   * @param {import('../../domain/entities/Rom')} rom
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async upsert(rom) { throw new Error('Not implemented'); }
}

module.exports = RomRepository;
