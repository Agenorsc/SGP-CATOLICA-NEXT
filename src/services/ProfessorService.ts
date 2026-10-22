import { UsuarioRepository } from '@/repositories/UsuarioRepository';
import { UsuarioModel } from '@/models/UsuarioModel';

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

    // Força role PROFESSOR para professores cadastrados
    professor.role = 'PROFESSOR';
    if (!professor.senha) {
      professor.senha = 'admin'; // Senha padrão caso não informada
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
