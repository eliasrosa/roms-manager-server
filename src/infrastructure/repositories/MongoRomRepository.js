const RomRepository = require('../../application/ports/RomRepository');
const RomEntity = require('../../domain/entities/Rom');
const RomModel = require('../db/RomModel');

/**
 * Implementação do RomRepository usando MongoDB/Mongoose.
 */
class MongoRomRepository extends RomRepository {
  /**
   * Mapeia um documento Mongoose para a entidade de domínio.
   * @param {object} doc
   * @returns {RomEntity}
   */
  _toEntity(doc) {
    return new RomEntity({
      platform:  doc.platform,
      filename:  doc.filename,
      size:      doc.size,
      md5:       doc.md5,
      sha1:      doc.sha1,
      crc32:     doc.crc32,
      modified:  doc.modified,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findAll(filters = {}) {
    const docs = await RomModel.find(filters).sort({ platform: 1, filename: 1 }).lean();
    return docs.map((doc) => this._toEntity(doc));
  }

  async findOne(platform, filename) {
    const doc = await RomModel.findOne({ platform, filename }).lean();
    return doc ? this._toEntity(doc) : null;
  }

  async findMeta(platform, filename) {
    const doc = await RomModel.findOne({ platform, filename }, { size: 1, modified: 1 }).lean();
    if (!doc) return null;
    return { size: doc.size, modified: doc.modified };
  }

  async upsert(rom) {
    await RomModel.findOneAndUpdate(
      { platform: rom.platform, filename: rom.filename },
      {
        platform: rom.platform,
        filename: rom.filename,
        size:     rom.size,
        md5:      rom.md5,
        sha1:     rom.sha1,
        crc32:    rom.crc32,
        modified: rom.modified,
      },
      { upsert: true, new: true }
    );
  }
}

module.exports = MongoRomRepository;
