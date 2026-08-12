const SyncRoms = require('../SyncRoms');

const FIXED_DATE = new Date('2024-01-01T00:00:00Z');

function makeStorage({ files = ['rom.gba'], meta = null, hashes = null } = {}) {
  return {
    listFiles:    jest.fn().mockResolvedValue(files),
    getFileMeta:  jest.fn().mockResolvedValue(meta  || { size: 1024, modified: FIXED_DATE }),
    computeHashes: jest.fn().mockResolvedValue(hashes || { md5: 'aaa', sha1: 'bbb', crc32: 'CCCCCCCC' }),
  };
}

function makeRepository({ meta = null } = {}) {
  return {
    findMeta: jest.fn().mockResolvedValue(meta),
    upsert:   jest.fn().mockResolvedValue(undefined),
  };
}

describe('SyncRoms', () => {
  it('indexa arquivo novo (sem registro no banco)', async () => {
    const repo    = makeRepository({ meta: null });
    const storage = makeStorage();
    const usecase = new SyncRoms(repo, storage);

    const result = await usecase.syncPlatform('gba');

    expect(repo.upsert).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ platform: 'gba', indexed: 1, skipped: 0 });
  });

  it('pula arquivo quando size e modified não mudaram', async () => {
    const existingMeta = { size: 1024, modified: FIXED_DATE };
    const repo    = makeRepository({ meta: existingMeta });
    const storage = makeStorage({ meta: existingMeta });
    const usecase = new SyncRoms(repo, storage);

    const result = await usecase.syncPlatform('gba');

    expect(repo.upsert).not.toHaveBeenCalled();
    expect(result).toEqual({ platform: 'gba', indexed: 0, skipped: 1 });
  });

  it('reindexe arquivo quando size mudou', async () => {
    const repo    = makeRepository({ meta: { size: 512, modified: FIXED_DATE } });
    const storage = makeStorage({ meta: { size: 1024, modified: FIXED_DATE } });
    const usecase = new SyncRoms(repo, storage);

    const result = await usecase.syncPlatform('gba');

    expect(repo.upsert).toHaveBeenCalledTimes(1);
    expect(result.indexed).toBe(1);
  });

  it('reindexe arquivo quando modified mudou', async () => {
    const repo    = makeRepository({ meta: { size: 1024, modified: new Date('2023-01-01') } });
    const storage = makeStorage({ meta: { size: 1024, modified: FIXED_DATE } });
    const usecase = new SyncRoms(repo, storage);

    const result = await usecase.syncPlatform('gba');

    expect(repo.upsert).toHaveBeenCalledTimes(1);
    expect(result.indexed).toBe(1);
  });

  it('retorna indexed:0 e skipped:0 quando diretório não existe', async () => {
    const storage = { listFiles: jest.fn().mockRejectedValue(new Error('Diretório não encontrado')) };
    const repo    = makeRepository();
    const usecase = new SyncRoms(repo, storage);

    const result = await usecase.syncPlatform('gba');

    expect(result).toEqual({ platform: 'gba', indexed: 0, skipped: 0 });
    expect(repo.upsert).not.toHaveBeenCalled();
  });

  it('upsert recebe Rom com os hashes corretos', async () => {
    const repo    = makeRepository({ meta: null });
    const storage = makeStorage({
      meta:   { size: 2048, modified: FIXED_DATE },
      hashes: { md5: 'md5hash', sha1: 'sha1hash', crc32: 'CRC32HEX' },
    });
    const usecase = new SyncRoms(repo, storage);

    await usecase.syncPlatform('gba');

    const rom = repo.upsert.mock.calls[0][0];
    expect(rom.platform).toBe('gba');
    expect(rom.filename).toBe('rom.gba');
    expect(rom.size).toBe(2048);
    expect(rom.md5).toBe('md5hash');
    expect(rom.sha1).toBe('sha1hash');
    expect(rom.crc32).toBe('CRC32HEX');
  });
});
