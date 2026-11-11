/** @jest-environment node */
import { hashPassword, verifyPassword, validatePassword } from '@/lib/password';
import { migratePasswords } from '../../scripts/migrate-passwords';

jest.setTimeout(20000);
describe('TSK-55 — senhas', () => {
  it('gera hashes bcrypt com sal exclusivo e verifica a senha', async () => {
    const password = 'Senha exclusiva 2026!';
    const a = await hashPassword(password), b = await hashPassword(password);
    expect(a).toMatch(/^\$2[aby]\$12\$/);
    expect(a).not.toBe(b);
    expect(await verifyPassword(password, a)).toBe(true);
    expect(await verifyPassword('errada', a)).toBe(false);
    expect(await verifyPassword('admin', 'admin')).toBe(false);
  });
  it('rejeita senhas curtas, tipos inválidos e truncamento UTF-8 do bcrypt', () => {
    for (const value of ['admin', '', null, 123, 'á'.repeat(37)]) expect(() => validatePassword(value)).toThrow();
    expect(() => validatePassword('á'.repeat(36))).not.toThrow();
  });
  it('pré-valida o lote antes de migrar contas com senha padrão', async () => {
    const prisma = { usuario: { findMany: jest.fn().mockResolvedValue([{ id: 'u1', email: 'u@sgp.test', senha: 'admin' }]) }, $transaction: jest.fn() };
    await expect(migratePasswords(prisma)).rejects.toThrow('PASSWORD_MIGRATION_JSON');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
  it('migra senha legada e mantém hashes existentes sem rehash', async () => {
    const hash = await hashPassword('Já migrada 2026!');
    const updateMany = jest.fn().mockResolvedValue({ count: 1 });
    const prisma = { usuario: { findMany: jest.fn().mockResolvedValue([
      { id: 'u1', email: 'u@sgp.test', senha: 'admin' }, { id: 'u2', email: 'v@sgp.test', senha: hash }
    ]) }, $transaction: async (fn: any) => fn({ usuario: { updateMany } }) };
    expect(await migratePasswords(prisma, { 'u@sgp.test': 'Nova senha 2026!' })).toBe(1);
    const args = updateMany.mock.calls[0][0];
    expect(args.where).toEqual({ id: 'u1', senha: 'admin' });
    expect(await verifyPassword('Nova senha 2026!', args.data.senha)).toBe(true);
  });
});
