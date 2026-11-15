import { UsuarioRepository } from '@/repositories/UsuarioRepository';
import { UsuarioModel } from '@/models/UsuarioModel';
import { hashPassword, isBcryptHash, validatePasswordStrength } from '@/lib/password';

export class ProfessorService {
  constructor(private usuarioRepository: UsuarioRepository = new UsuarioRepository()) {}

  async listarProfessores(): Promise<UsuarioModel[]> {
    const todos = await this.usuarioRepository.findAll();
    return todos.filter(u => u.role === 'PROFESSOR');
  }

  async buscarPorId(id: string): Promise<UsuarioModel | undefined> {
    const usuario = await this.usuarioRepository.findById(id);
    return usuario && usuario.role === 'PROFESSOR' ? usuario : undefined;
  }

  async salvarProfessor(professor: UsuarioModel, userRole: string = 'ADMIN'): Promise<UsuarioModel> {
    if (userRole !== 'ADMIN') {
      throw new Error('Acesso negado: Apenas administradores podem cadastrar ou editar professores.');
    }

    if (!professor.nome.trim()) {
      throw new Error('O nome do professor é obrigatório.');
    }

    if (!professor.email.trim()) {
      throw new Error('O e-mail do professor é obrigatório.');
    }

    // Força papel PROFESSOR para os docentes cadastrados
    professor.role = 'PROFESSOR';

    // Se o professor já existe no repositório, verifica se a senha foi informada ou deve ser mantida
    const existente = await this.usuarioRepository.findByEmail(professor.email);

    if (professor.senha && professor.senha.trim().length > 0) {
      // Rejeita explicitamente a antiga senha padrão 'admin'
      if (professor.senha.trim().toLowerCase() === 'admin') {
        throw new Error('A senha padrão "admin" não é permitida por motivos de segurança. Defina uma senha segura.');
      }

      // Se ainda não for um hash bcrypt, valida a força e aplica hash
      if (!isBcryptHash(professor.senha)) {
        const validacao = validatePasswordStrength(professor.senha);
        if (!validacao.isValid) {
          throw new Error(validacao.message || 'Senha fraca informada para o professor.');
        }
        professor.senha = await hashPassword(professor.senha.trim());
      }
    } else if (existente && existente.senha) {
      // Mantém a senha/hash já existente caso o admin esteja apenas editando nome/disciplina
      professor.senha = existente.senha;
    } else {
      // Para novos cadastros sem senha explícita, define uma senha segura inicial criptografada
      // e NUNCA a senha fraca 'admin'
      professor.senha = await hashPassword('Prof@Catolica2026!');
    }

    return this.usuarioRepository.save(professor);
  }

  async excluirProfessor(id: string, userRole: string = 'ADMIN'): Promise<boolean> {
    if (userRole !== 'ADMIN') {
      throw new Error('Acesso negado: Apenas administradores podem excluir professores.');
    }

    return this.usuarioRepository.delete(id);
  }
}
