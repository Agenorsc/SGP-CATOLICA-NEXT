import { UsuarioRepository } from '@/repositories/UsuarioRepository';
import { UserSession } from '@/types';

export class AuthService {
  constructor(private usuarioRepository: UsuarioRepository = new UsuarioRepository()) {}

  async login(email: string, senha: string): Promise<UserSession> {
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanSenha = (senha || '').trim();

    if (!cleanEmail || !cleanSenha) {
      throw new Error('Informe o e-mail e a senha de acesso.');
    }

    const usuario = await this.usuarioRepository.findByEmail(cleanEmail);

    if (!usuario) {
      throw new Error('Credenciais inválidas. E-mail não encontrado no sistema.');
    }

    // Validação de senha
    if (usuario.senha !== cleanSenha) {
      throw new Error('Credenciais inválidas. Senha incorreta.');
    }

    return {
      id: usuario.id,
      name: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      disciplina: usuario.disciplina || undefined
    };
  }

  isAdmin(session: UserSession | null): boolean {
    return session?.role === 'ADMIN';
  }
}
