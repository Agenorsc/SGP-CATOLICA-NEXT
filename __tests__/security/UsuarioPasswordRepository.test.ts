/** @jest-environment node */
jest.mock('@/lib/prisma', () => ({ prisma: { usuario: { findUnique: jest.fn(), upsert: jest.fn() } } }));
import { prisma } from '@/lib/prisma';
import { PrismaUsuarioRepository } from '@/repositories/prisma/PrismaUsuarioRepository';
import { UsuarioModel } from '@/models/UsuarioModel';
import { verifyPassword } from '@/lib/password';
const db = prisma.usuario as unknown as { findUnique: jest.Mock; upsert: jest.Mock };
describe('Persistência de senhas de usuários', () => {
  beforeEach(() => { jest.clearAllMocks(); db.upsert.mockImplementation(async ({ create }) => create); });
  it('persiste somente hash para usuários novos', async () => {
    db.findUnique.mockResolvedValue(null);
    await new PrismaUsuarioRepository().save(new UsuarioModel({ email: 'u@sgp.test', senha: 'Senha exclusiva 2026!' }));
    const { create, update } = db.upsert.mock.calls[0][0];
    expect(await verifyPassword('Senha exclusiva 2026!', create.senha)).toBe(true);
    expect(update).not.toHaveProperty('senha');
  });
  it('não redefine a senha durante edição do perfil', async () => {
    db.findUnique.mockResolvedValue({ senha: 'hash-existente' });
    await new PrismaUsuarioRepository().save(new UsuarioModel({ email: 'u@sgp.test', nome: 'Novo nome' }));
    expect(db.upsert.mock.calls[0][0].update).not.toHaveProperty('senha');
  });
  it('recusa senha padrão no cadastro e troca sem comprovação no perfil', async () => {
    const repo = new PrismaUsuarioRepository();
    db.findUnique.mockResolvedValue(null);
    await expect(repo.save(new UsuarioModel({ email: 'u@sgp.test', senha: 'admin' }))).rejects.toThrow('12 caracteres');
    db.findUnique.mockResolvedValue({ senha: 'hash-existente' });
    await expect(repo.save(new UsuarioModel({ email: 'u@sgp.test', senha: 'Nova senha 2026!' }))).rejects.toThrow('Trocar senha');
    expect(db.upsert).not.toHaveBeenCalled();
  });
});
