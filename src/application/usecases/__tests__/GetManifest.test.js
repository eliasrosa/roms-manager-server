const GetManifest = require('../GetManifest');
const Rom = require('../../../domain/entities/Rom');

function makeRom(overrides = {}) {
  return new Rom({
    platform:  'gba',
    filename:  'Mario Kart (USA).gba',
    size:      4194304,
    md5:       'abc',
    sha1:      'def',
    crc32:     'AD4D5EC2',
    modified:  new Date(),
    ...overrides,
  });
}

function makeRepository(roms = []) {
  return { findAll: jest.fn().mockResolvedValue(roms) };
}

describe('GetManifest', () => {
  it('busca ROMs filtrando pela plataforma', async () => {
    const repo = makeRepository([]);
    const usecase = new GetManifest(repo);

    await usecase.execute('gba');

    expect(repo.findAll).toHaveBeenCalledWith({ platform: 'gba' });
  });

  it('retorna platform, total e roms no formato manifest', async () => {
    const roms = [makeRom(), makeRom({ filename: 'Zelda.gba' })];
    const repo = makeRepository(roms);
    const usecase = new GetManifest(repo);

    const result = await usecase.execute('gba');

    expect(result.platform).toBe('gba');
    expect(result.total).toBe(2);
    expect(result.roms).toHaveLength(2);
  });

  it('cada entrada do manifest contém apenas filename, size e crc32', async () => {
    const rom = makeRom();
    const repo = makeRepository([rom]);
    const usecase = new GetManifest(repo);

    const result = await usecase.execute('gba');
    const entry = result.roms[0];

    expect(entry).toEqual({
      filename: 'Mario Kart (USA).gba',
      size:     4194304,
      crc32:    'AD4D5EC2',
    });
    expect(entry.md5).toBeUndefined();
    expect(entry.sha1).toBeUndefined();
  });

  it('retorna lista vazia quando plataforma não tem ROMs', async () => {
    const repo = makeRepository([]);
    const usecase = new GetManifest(repo);

    const result = await usecase.execute('fbneo');

    expect(result.total).toBe(0);
    expect(result.roms).toEqual([]);
  });
});
