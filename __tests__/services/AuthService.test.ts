import { AuthService } from '../../src/services/AuthService';
import { UsuarioRepository } from '../../src/repositories/UsuarioRepository';
import { UsuarioModel } from '../../src/models/UsuarioModel';

describe('AuthService - Autenticação Real do SGP Católica', () => {
  let authService: AuthService;
  let mockUsuarioRepo: UsuarioRepository;

  const mockUsuarios: UsuarioModel[] = [
    new UsuarioModel({
      id: 'usr-admin-01',
      nome: 'Administrador SGP',
      email: 'admin@admin.com',
      senha: 'admin',
      role: 'ADMIN',
      disciplina: 'Gestão Geral'
    }),
    new UsuarioModel({
      id: 'usr-prof-01',
      nome: 'Prof. Agenor Alvise',
      email: 'prof.agenor@catolica.edu.br',
      senha: 'admin',
      role: 'PROFESSOR',
      disciplina: 'Engenharia de Software IV'
    })
  ];

  beforeEach(() => {
    mockUsuarioRepo = new UsuarioRepository();
    jest.spyOn(mockUsuarioRepo, 'findAll').mockResolvedValue(mockUsuarios);
    jest.spyOn(mockUsuarioRepo, 'findByEmail').mockImplementation(async (email: string) => {
      const clean = email.toLowerCase().trim();
      return mockUsuarios.find(u => u.email === clean);
    });
    authService = new AuthService(mockUsuarioRepo);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve autenticar o usuário padrão admin@admin.com com a senha admin', async () => {
    const session = await authService.login('admin@admin.com', 'admin');

    expect(session).toBeDefined();
    expect(session.email).toBe('admin@admin.com');
    expect(session.role).toBe('ADMIN');
    expect(session.name).toBe('Administrador SGP');
    expect(authService.isAdmin(session)).toBe(true);
  });

  it('deve autenticar um professor cadastrado e reconhecer seu papel', async () => {
    const session = await authService.login('prof.agenor@catolica.edu.br', 'admin');

    expect(session).toBeDefined();
    expect(session.email).toBe('prof.agenor@catolica.edu.br');
    expect(session.role).toBe('PROFESSOR');
    expect(session.disciplina).toBe('Engenharia de Software IV');
    expect(authService.isAdmin(session)).toBe(false);
  });

  it('deve rejeitar login com senha incorreta', async () => {
    await expect(authService.login('admin@admin.com', 'senha_errada'))
      .rejects
      .toThrow('Credenciais inválidas. Senha incorreta.');
  });

  it('deve rejeitar login com e-mail não cadastrado', async () => {
    await expect(authService.login('inexistente@catolica.edu.br', 'admin'))
      .rejects
      .toThrow('Credenciais inválidas. E-mail não encontrado no sistema.');
  });

  it('deve exigir e-mail e senha preenchidos', async () => {
    await expect(authService.login('', 'admin'))
      .rejects
      .toThrow('Informe o e-mail e a senha de acesso.');

    await expect(authService.login('admin@admin.com', ''))
      .rejects
      .toThrow('Informe o e-mail e a senha de acesso.');
  });
});
