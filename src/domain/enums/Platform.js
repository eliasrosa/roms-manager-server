/** @enum {string} */
const Platform = Object.freeze({
  NES:           'nes',
  SNES:          'snes',
  GB:            'gb',
  GBC:           'gbc',
  GBA:           'gba',
  N64:           'n64',
  GENESIS:       'genesis',
  MASTER_SYSTEM: 'master-system',
  GAME_GEAR:     'game-gear',
  SEGA_CD:       'sega-cd',
  SATURN:        'saturn',
  DREAMCAST:     'dc',
  PSX:           'psx',
  PSP:           'psp',
  GAMECUBE:      'gc',
  WII:           'wii',
  FBNEO:         'fbneo',
});

/** Extensões aceitas por plataforma */
const PLATFORM_EXTENSIONS = Object.freeze({
  [Platform.NES]:           ['.nes', '.unf', '.unif', '.fds'],
  [Platform.SNES]:          ['.sfc', '.smc', '.fig', '.swc', '.bs', '.st'],
  [Platform.GB]:            ['.gb'],
  [Platform.GBC]:           ['.gbc'],
  [Platform.GBA]:           ['.gba', '.sgb'],
  [Platform.N64]:           ['.z64', '.n64', '.v64'],
  [Platform.GENESIS]:       ['.md', '.gen', '.bin', '.smd'],
  [Platform.MASTER_SYSTEM]: ['.sms', '.bin'],
  [Platform.GAME_GEAR]:     ['.gg', '.bin'],
  [Platform.SEGA_CD]:       ['.cue', '.bin', '.iso', '.chd'],
  [Platform.SATURN]:        ['.cue', '.bin', '.iso', '.chd'],
  [Platform.DREAMCAST]:     ['.chd', '.cdi', '.gdi', '.cue', '.bin'],
  [Platform.PSX]:           ['.chd', '.cue', '.bin', '.iso'],
  [Platform.PSP]:           ['.iso', '.cso', '.pbp', '.chd'],
  [Platform.GAMECUBE]:      ['.iso', '.gcm', '.chd', '.rvz'],
  [Platform.WII]:           ['.iso', '.chd', '.rvz', '.wbfs', '.wia', '.m3u'],
  [Platform.FBNEO]:         ['.zip'],
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

/**
 * Retorna extensões aceitas para uma plataforma.
 * @param {string} platform
 * @returns {string[]}
 */
function getExtensions(platform) {
  return PLATFORM_EXTENSIONS[platform] || [];
}

module.exports = { Platform, PLATFORM_VALUES, PLATFORM_EXTENSIONS, isValidPlatform, getExtensions };
