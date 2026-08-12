/** @enum {string} */
const Platform = Object.freeze({
  GBA:           'gba',
  GB:            'gb',
  GBC:           'gbc',
  N64:           'n64',
  NES:           'nes',
  SNES:          'snes',
  GENESIS:       'genesis',
  GAME_GEAR:     'game-gear',
  MASTER_SYSTEM: 'master-system',
  FBNEO:         'fbneo',
});

/** @type {string[]} */
const PLATFORM_VALUES = Object.values(Platform);

/**
 * @param {string} value
 * @returns {boolean}
 */
function isValidPlatform(value) {
  return PLATFORM_VALUES.includes(value);
}

module.exports = { Platform, PLATFORM_VALUES, isValidPlatform };
