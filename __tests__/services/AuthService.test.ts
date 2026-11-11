import { AuthService } from '@/services/AuthService';

describe('AuthService — autenticação pela API', () => {
  const service = new AuthService();
  const originalFetch = global.fetch;
  afterEach(() => { global.fetch = originalFetch; });
  it('normaliza e-mail e preserva espaços na senha', async () => {
    const session = { id: 'u1', email: 'user@example.com', name: 'Docente', role: 'PROFESSOR' };
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => session });
    expect(await service.login(' USER@EXAMPLE.COM ', ' senha exclusiva ')).toEqual(session);
    expect(fetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({ body: JSON.stringify({ email: 'user@example.com', senha: ' senha exclusiva ' }) }));
    expect(service.isAdmin(session as any)).toBe(false);
  });
  it('não autentica localmente quando a API falha', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
    await expect(service.login('admin@admin.com', 'admin')).rejects.toThrow('offline');
  });
  it('recusa credenciais rejeitadas pela API', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });
    await expect(service.login('user@example.com', 'incorreta')).rejects.toThrow('Credenciais inválidas');
  });
  it('exige e-mail e senha', async () => {
    await expect(service.login('', 'senha')).rejects.toThrow('Informe');
    await expect(service.login('user@example.com', '')).rejects.toThrow('Informe');
  });
});
