const ListRoms = require('../ListRoms');

function makeRepository(roms = []) {
  return { findAll: jest.fn().mockResolvedValue(roms) };
}

describe('ListRoms', () => {
  it('repassa filtros vazios quando nenhum param é fornecido', async () => {
    const repo = makeRepository([]);
    const usecase = new ListRoms(repo);

    await usecase.execute({});

    expect(repo.findAll).toHaveBeenCalledWith({});
  });

  it('normaliza md5 para lowercase', async () => {
    const repo = makeRepository([]);
    const usecase = new ListRoms(repo);

    await usecase.execute({ md5: '4E46DD3AE5C9C70C49587D093517049A' });

    expect(repo.findAll).toHaveBeenCalledWith({ md5: '4e46dd3ae5c9c70c49587d093517049a' });
  });

  it('normaliza sha1 para lowercase', async () => {
    const repo = makeRepository([]);
    const usecase = new ListRoms(repo);

    await usecase.execute({ sha1: 'ABCDEF' });

    expect(repo.findAll).toHaveBeenCalledWith({ sha1: 'abcdef' });
  });

  it('normaliza crc32 para uppercase', async () => {
    const repo = makeRepository([]);
    const usecase = new ListRoms(repo);

    await usecase.execute({ crc32: 'ad4d5ec2' });

    expect(repo.findAll).toHaveBeenCalledWith({ crc32: 'AD4D5EC2' });
  });

  it('combina múltiplos filtros', async () => {
    const repo = makeRepository([]);
    const usecase = new ListRoms(repo);

    await usecase.execute({ platform: 'gba', crc32: 'ad4d5ec2' });

    expect(repo.findAll).toHaveBeenCalledWith({ platform: 'gba', crc32: 'AD4D5EC2' });
  });

  it('retorna total correto e lista de ROMs', async () => {
    const fakeRoms = [{ filename: 'a.gba' }, { filename: 'b.gba' }];
    const repo = makeRepository(fakeRoms);
    const usecase = new ListRoms(repo);

    const result = await usecase.execute({});

    expect(result.total).toBe(2);
    expect(result.roms).toBe(fakeRoms);
  });
});
