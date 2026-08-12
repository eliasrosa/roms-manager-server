/**
 * Port — contrato de acesso ao filesystem de ROMs.
 * A infraestrutura deve implementar todos os métodos abaixo.
 */
class FileStorage {
  /**
   * Lista arquivos de ROMs de uma plataforma.
   * @param {string} platform
   * @returns {Promise<string[]>} lista de filenames
   */
  // eslint-disable-next-line no-unused-vars
  async listFiles(platform) { throw new Error('Not implemented'); }

  /**
   * Retorna metadados de um arquivo (size, mtime).
   * @param {string} platform
   * @param {string} filename
   * @returns {Promise<{ size: number, modified: Date }>}
   */
  // eslint-disable-next-line no-unused-vars
  async getFileMeta(platform, filename) { throw new Error('Not implemented'); }

  /**
   * Retorna o path absoluto de um arquivo para uso no download.
   * @param {string} platform
   * @param {string} filename
   * @returns {string}
   */
  // eslint-disable-next-line no-unused-vars
  getFilePath(platform, filename) { throw new Error('Not implemented'); }

  /**
   * Verifica se um arquivo existe no disco.
   * @param {string} platform
   * @param {string} filename
   * @returns {boolean}
   */
  // eslint-disable-next-line no-unused-vars
  fileExists(platform, filename) { throw new Error('Not implemented'); }

  /**
   * Computa hashes MD5, SHA1 e CRC32 de um arquivo.
   * @param {string} platform
   * @param {string} filename
   * @returns {Promise<{ md5: string, sha1: string, crc32: string }>}
   */
  // eslint-disable-next-line no-unused-vars
  async computeHashes(platform, filename) { throw new Error('Not implemented'); }
}

module.exports = FileStorage;
