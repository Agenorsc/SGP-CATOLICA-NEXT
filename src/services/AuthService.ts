import { UsuarioRepository } from '@/repositories/UsuarioRepository';
import { UserSession } from '@/types';
import {
  comparePassword,
  hashPassword,
  isBcryptHash,
  validatePasswordStrength
} from '@/lib/password';

export interface TrocarSenhaParams {
  usuarioId?: string;
  email?: string;
  senhaAtual: string;
  novaSenha: string;
  confirmacaoNovaSenha?: string;
}

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

    // Validação segura com suporte a hash bcrypt e retrocompatibilidade com legado
    const senhaValida = await comparePassword(cleanSenha, usuario.senha);

    if (!senhaValida) {
      throw new Error('Credenciais inválidas. Senha incorreta.');
    }

    // Migração transparente em tempo de execução: se a senha ainda estiver em texto plano,
    // atualiza para hash bcrypt sem interromper a sessão do usuário.
    if (usuario.senha && !isBcryptHash(usuario.senha)) {
      try {
        usuario.senha = await hashPassword(cleanSenha);
        await this.usuarioRepository.save(usuario);
      } catch (upgradeErr) {
        console.warn('Aviso: Não foi possível atualizar hash legado em segundo plano:', upgradeErr);
      }
    }

    return {
      id: usuario.id,
      name: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      disciplina: usuario.disciplina || undefined
    };
  }

  /**
   * Realiza a alteração de senha de um usuário autenticado com validações de segurança:
   * - Conferência da senha atual
   * - Verificação de força (mínimo 6 caracteres)
   * - Proibição explícita da senha padrão fraca 'admin'
   * - Confirmação e impedimento de reuso da senha atual
   * - Criptografia com bcrypt antes da persistência
   */
  async trocarSenha(params: TrocarSenhaParams): Promise<{ success: boolean; message: string }> {
    const { usuarioId, email, senhaAtual, novaSenha, confirmacaoNovaSenha } = params;

    if (!usuarioId && !email) {
      throw new Error('Identificação do usuário (id ou e-mail) é obrigatória.');
    }

    const cleanSenhaAtual = (senhaAtual || '').trim();
    const cleanNovaSenha = (novaSenha || '').trim();

    if (!cleanSenhaAtual) {
      throw new Error('Informe a senha atual.');
    }

    if (!cleanNovaSenha) {
      throw new Error('Informe a nova senha.');
    }

    // 1. Busca o usuário por ID ou por E-mail
    let usuario = usuarioId ? await this.usuarioRepository.findById(usuarioId) : undefined;
    if (!usuario && email) {
      usuario = await this.usuarioRepository.findByEmail(email);
    }

    if (!usuario) {
      throw new Error('Usuário não encontrado no sistema.');
    }

    // 2. Valida a senha atual
    const senhaAtualValida = await comparePassword(cleanSenhaAtual, usuario.senha);
    if (!senhaAtualValida) {
      throw new Error('Senha atual incorreta.');
    }

    // 3. Valida se a nova senha coincide com a confirmação (se informada)
    if (confirmacaoNovaSenha !== undefined && cleanNovaSenha !== confirmacaoNovaSenha.trim()) {
      throw new Error('A nova senha e a confirmação de senha não coincidem.');
    }

    // 4. Impede que a nova senha seja idêntica à atual
    if (cleanSenhaAtual === cleanNovaSenha) {
      throw new Error('A nova senha deve ser diferente da senha atual.');
    }

    // 5. Valida critérios de segurança da nova senha (tamanho e proibição de 'admin')
    const validacao = validatePasswordStrength(cleanNovaSenha);
    if (!validacao.isValid) {
      throw new Error(validacao.message || 'Senha inválida.');
    }

    // 6. Gera o hash bcrypt da nova senha e persiste
    usuario.senha = await hashPassword(cleanNovaSenha);
    await this.usuarioRepository.save(usuario);

    return {
      success: true,
      message: 'Senha alterada com sucesso.'
    };
  }

  isAdmin(session: UserSession | null): boolean {
    return session?.role === 'ADMIN';
  }
}
