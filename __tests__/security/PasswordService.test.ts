/** @jest-environment node */
jest.mock('@/lib/prisma', () => ({ prisma: { usuario: { findUnique: jest.fn(), updateMany: jest.fn() } } }));
import { prisma } from '@/lib/prisma';
import { PasswordService } from '@/services/PasswordService';
import { hashPassword, verifyPassword } from '@/lib/password';
const db = prisma.usuario as unknown as { findUnique: jest.Mock; updateMany: jest.Mock };
jest.setTimeout(20000);
describe('Troca de senha', () => {
  let hash: string;
  beforeAll(async () => { hash = await hashPassword('Senha anterior 2026!'); });
  beforeEach(() => { jest.clearAllMocks(); db.findUnique.mockResolvedValue({ id: 'u1', senha: hash }); db.updateMany.mockResolvedValue({ count: 1 }); });
  it('exige a senha atual antes de gravar o novo hash', async () => {
    const service = new PasswordService();
    expect(await service.change('u@sgp.test', 'errada', 'Nova senha 2026!')).toBe(false);
    expect(db.updateMany).not.toHaveBeenCalled();
    expect(await service.change('u@sgp.test', 'Senha anterior 2026!', 'Nova senha 2026!')).toBe(true);
    const args = db.updateMany.mock.calls[0][0];
    expect(args.where).toEqual({ id: 'u1', senha: hash });
    expect(await verifyPassword('Nova senha 2026!', args.data.senha)).toBe(true);
    expect(await verifyPassword('Senha anterior 2026!', args.data.senha)).toBe(false);
  });
  it('não altera contas inexistentes nem reutiliza a senha atual', async () => {
    db.findUnique.mockResolvedValue(null);
    expect(await new PasswordService().change('x@sgp.test', 'Senha anterior 2026!', 'Nova senha 2026!')).toBe(false);
    await expect(new PasswordService().change('x@sgp.test', 'Senha anterior 2026!', 'Senha anterior 2026!')).rejects.toThrow('diferente');
    expect(db.updateMany).not.toHaveBeenCalled();
  });
  it('recusa troca concorrente e senha fraca', async () => {
    db.updateMany.mockResolvedValue({ count: 0 });
    expect(await new PasswordService().change('u@sgp.test', 'Senha anterior 2026!', 'Nova senha 2026!')).toBe(false);
    await expect(new PasswordService().change('u@sgp.test', 'Senha anterior 2026!', 'admin')).rejects.toThrow('12 caracteres');
  });
});
