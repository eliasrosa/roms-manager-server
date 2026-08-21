/**
 * Entidade de domínio — ROM.
 * Objeto puro sem dependência de framework.
 */
class Rom {
  /**
   * @param {object} props
   * @param {string} props.platform
   * @param {string} props.filename
   * @param {number} props.size
   * @param {string} props.md5
   * @param {string} props.sha1
   * @param {string} props.crc32
   * @param {Date}   props.modified
   * @param {Date}   [props.createdAt]
   * @param {Date}   [props.updatedAt]
   */
  constructor({ platform, filename, size, md5, sha1, crc32, modified, createdAt, updatedAt }) {
    this.platform  = platform;
    this.filename  = filename;
    this.size      = size;
    this.md5       = md5;
    this.sha1      = sha1;
    this.crc32     = crc32;
    this.modified  = modified;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

}

module.exports = Rom;
