import { AuthService } from '../../src/services/AuthService';
import { UsuarioRepository } from '../../src/repositories/UsuarioRepository';
import { UsuarioModel } from '../../src/models/UsuarioModel';
import { hashPasswordSync, isBcryptHash } from '../../src/lib/password';

describe('AuthService - Autenticação e Segurança (Bcrypt & Troca de Senha)', () => {
  let authService: AuthService;
  let mockUsuarioRepo: UsuarioRepository;

  let mockUsuarios: UsuarioModel[];

  beforeEach(() => {
    mockUsuarios = [
      new UsuarioModel({
        id: 'usr-admin-01',
        nome: 'Administrador SGP',
        email: 'admin@admin.com',
        senha: hashPasswordSync('Admin@Catolica2026!'),
        role: 'ADMIN',
        disciplina: 'Gestão Geral'
      }),
      new UsuarioModel({
        id: 'usr-prof-01',
        nome: 'Prof. Agenor Alvise',
        email: 'prof.agenor@catolica.edu.br',
        senha: hashPasswordSync('Agenor@Catolica2026!'),
        role: 'PROFESSOR',
        disciplina: 'Engenharia de Software IV'
      }),
      new UsuarioModel({
        id: 'usr-legado-01',
        nome: 'Usuário Legado',
        email: 'legado@catolica.edu.br',
        senha: 'senhaLegada123', // Em texto claro para testar retrocompatibilidade
        role: 'PROFESSOR',
        disciplina: 'Introdução'
      })
    ];

    mockUsuarioRepo = new UsuarioRepository();
    jest.spyOn(mockUsuarioRepo, 'findAll').mockImplementation(async () => mockUsuarios);
    jest.spyOn(mockUsuarioRepo, 'findById').mockImplementation(async (id: string) => {
      return mockUsuarios.find(u => u.id === id);
    });
    jest.spyOn(mockUsuarioRepo, 'findByEmail').mockImplementation(async (email: string) => {
      const clean = email.toLowerCase().trim();
      return mockUsuarios.find(u => u.email === clean);
    });
    jest.spyOn(mockUsuarioRepo, 'save').mockImplementation(async (usuario: UsuarioModel) => {
      const idx = mockUsuarios.findIndex(u => u.id === usuario.id || u.email === usuario.email);
      if (idx >= 0) {
        mockUsuarios[idx] = usuario;
      } else {
        mockUsuarios.push(usuario);
      }
      return usuario;
    });

    authService = new AuthService(mockUsuarioRepo);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Autenticação com Hash Bcrypt e Proteção de Dados', () => {
    it('deve autenticar o Administrador com hash Bcrypt e senha segura', async () => {
      const session = await authService.login('admin@admin.com', 'Admin@Catolica2026!');

      expect(session).toBeDefined();
      expect(session.email).toBe('admin@admin.com');
      expect(session.role).toBe('ADMIN');
      expect(session.name).toBe('Administrador SGP');
      expect(authService.isAdmin(session)).toBe(true);
    });

    it('deve autenticar professor com hash Bcrypt e reconhecer sua disciplina', async () => {
      const session = await authService.login('prof.agenor@catolica.edu.br', 'Agenor@Catolica2026!');

      expect(session).toBeDefined();
      expect(session.email).toBe('prof.agenor@catolica.edu.br');
      expect(session.role).toBe('PROFESSOR');
      expect(session.disciplina).toBe('Engenharia de Software IV');
      expect(authService.isAdmin(session)).toBe(false);
    });

    it('deve manter retrocompatibilidade com senhas legadas e atualizar para Bcrypt automaticamente', async () => {
      const usuarioAntes = mockUsuarios.find(u => u.email === 'legado@catolica.edu.br');
      expect(isBcryptHash(usuarioAntes?.senha)).toBe(false);

      const session = await authService.login('legado@catolica.edu.br', 'senhaLegada123');

      expect(session).toBeDefined();
      expect(session.email).toBe('legado@catolica.edu.br');

      const usuarioDepois = mockUsuarios.find(u => u.email === 'legado@catolica.edu.br');
      expect(isBcryptHash(usuarioDepois?.senha)).toBe(true);
    });

    it('deve rejeitar login com senha incorreta', async () => {
      await expect(authService.login('admin@admin.com', 'senha_errada'))
        .rejects
        .toThrow('Credenciais inválidas. Senha incorreta.');
    });

    it('deve rejeitar login com e-mail não cadastrado', async () => {
      await expect(authService.login('inexistente@catolica.edu.br', 'Admin@Catolica2026!'))
        .rejects
        .toThrow('Credenciais inválidas. E-mail não encontrado no sistema.');
    });

    it('deve exigir e-mail e senha preenchidos', async () => {
      await expect(authService.login('', 'Admin@Catolica2026!'))
        .rejects
        .toThrow('Informe o e-mail e a senha de acesso.');

      await expect(authService.login('admin@admin.com', ''))
        .rejects
        .toThrow('Informe o e-mail e a senha de acesso.');
    });
  });

  describe('Troca de Senha e Validações de Segurança', () => {
    it('deve alterar a senha com sucesso e armazenar o novo hash Bcrypt', async () => {
      const resultado = await authService.trocarSenha({
        usuarioId: 'usr-admin-01',
        senhaAtual: 'Admin@Catolica2026!',
        novaSenha: 'NovaSenhaSegura@2026',
        confirmacaoNovaSenha: 'NovaSenhaSegura@2026'
      });

      expect(resultado.success).toBe(true);
      expect(resultado.message).toContain('sucesso');

      const admin = mockUsuarios.find(u => u.id === 'usr-admin-01');
      expect(isBcryptHash(admin?.senha)).toBe(true);

      // Deve conseguir logar com a nova senha
      const novaSessao = await authService.login('admin@admin.com', 'NovaSenhaSegura@2026');
      expect(novaSessao).toBeDefined();

      // Antiga senha não deve mais ser aceita
      await expect(authService.login('admin@admin.com', 'Admin@Catolica2026!'))
        .rejects
        .toThrow('Credenciais inválidas. Senha incorreta.');
    });

    it('deve rejeitar troca de senha se a senha atual for incorreta', async () => {
      await expect(authService.trocarSenha({
        usuarioId: 'usr-admin-01',
        senhaAtual: 'SenhaErrada123',
        novaSenha: 'NovaSenhaSegura@2026',
        confirmacaoNovaSenha: 'NovaSenhaSegura@2026'
      })).rejects.toThrow('Senha atual incorreta.');
    });

    it('deve BLOQUEAR o uso da senha padrão descontinuada "admin"', async () => {
      await expect(authService.trocarSenha({
        usuarioId: 'usr-admin-01',
        senhaAtual: 'Admin@Catolica2026!',
        novaSenha: 'admin',
        confirmacaoNovaSenha: 'admin'
      })).rejects.toThrow('A senha padrão "admin" foi descontinuada');
    });

    it('deve rejeitar nova senha curta (< 6 caracteres)', async () => {
      await expect(authService.trocarSenha({
        usuarioId: 'usr-admin-01',
        senhaAtual: 'Admin@Catolica2026!',
        novaSenha: '123',
        confirmacaoNovaSenha: '123'
      })).rejects.toThrow('no mínimo 6 caracteres');
    });

    it('deve rejeitar quando a nova senha for idêntica à atual', async () => {
      await expect(authService.trocarSenha({
        usuarioId: 'usr-admin-01',
        senhaAtual: 'Admin@Catolica2026!',
        novaSenha: 'Admin@Catolica2026!',
        confirmacaoNovaSenha: 'Admin@Catolica2026!'
      })).rejects.toThrow('A nova senha deve ser diferente da senha atual.');
    });

    it('deve rejeitar quando a confirmação não coincidir com a nova senha', async () => {
      await expect(authService.trocarSenha({
        usuarioId: 'usr-admin-01',
        senhaAtual: 'Admin@Catolica2026!',
        novaSenha: 'NovaSenhaSegura@2026',
        confirmacaoNovaSenha: 'OutraConfirmacaoDiferente'
      })).rejects.toThrow('A nova senha e a confirmação de senha não coincidem.');
    });
  });
});
