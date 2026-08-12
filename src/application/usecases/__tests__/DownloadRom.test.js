const { DownloadRom, NotFoundError } = require('../DownloadRom');
const Rom = require('../../../domain/entities/Rom');

function makeRom() {
  return new Rom({
    platform: 'gba', filename: 'Mario Kart (USA).gba',
    size: 4194304, md5: 'abc', sha1: 'def', crc32: 'AD4D5EC2', modified: new Date(),
  });
}

function makeRepository(rom = null) {
  return { findOne: jest.fn().mockResolvedValue(rom) };
}

function makeStorage({ exists = true, filePath = '/data/gba/roms/Mario Kart (USA).gba' } = {}) {
  return {
    fileExists:  jest.fn().mockReturnValue(exists),
    getFilePath: jest.fn().mockReturnValue(filePath),
  };
}

describe('DownloadRom', () => {
  it('lança NotFoundError quando ROM não está no banco', async () => {
    const usecase = new DownloadRom(makeRepository(null), makeStorage());

    await expect(usecase.execute('gba', 'Mario Kart (USA).gba'))
      .rejects.toThrow(NotFoundError);
  });

  it('lança NotFoundError quando arquivo não existe no disco', async () => {
    const usecase = new DownloadRom(makeRepository(makeRom()), makeStorage({ exists: false }));

    await expect(usecase.execute('gba', 'Mario Kart (USA).gba'))
      .rejects.toThrow(NotFoundError);
  });

  it('retorna o path do arquivo quando ROM existe no banco e no disco', async () => {
    const expectedPath = '/data/gba/roms/Mario Kart (USA).gba';
    const usecase = new DownloadRom(makeRepository(makeRom()), makeStorage({ filePath: expectedPath }));

    const result = await usecase.execute('gba', 'Mario Kart (USA).gba');

    expect(result).toBe(expectedPath);
  });

  it('verifica existência no disco apenas após encontrar no banco', async () => {
    const storage = makeStorage({ exists: false });
    const usecase = new DownloadRom(makeRepository(null), storage);

    await expect(usecase.execute('gba', 'Mario Kart (USA).gba')).rejects.toThrow(NotFoundError);

    // fileExists não deve ser chamado se ROM não está no banco
    expect(storage.fileExists).not.toHaveBeenCalled();
  });
});
