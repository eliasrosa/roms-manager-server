const mongoose = require('mongoose');
const { PLATFORM_VALUES } = require('../../domain/enums/Platform');

const romSchema = new mongoose.Schema(
  {
    platform: {
      type:     String,
      required: true,
      enum:     PLATFORM_VALUES,
      index:    true,
    },
    filename: {
      type:     String,
      required: true,
    },
    size: {
      type:     Number,
      required: true,
    },
    md5: {
      type:     String,
      required: true,
    },
    sha1: {
      type:     String,
      required: true,
    },
    crc32: {
      type:     String,
      required: true,
    },
    modified: {
      type:     Date,
      required: true,
    },
  },
  { timestamps: true }
);

romSchema.index({ platform: 1, filename: 1 }, { unique: true });

module.exports = mongoose.model('Rom', romSchema);
