import { PrismaTurmaRepository } from '@/repositories/prisma/PrismaTurmaRepository';
import { TurmaRepository } from '@/repositories/TurmaRepository';
import { TurmaModel } from '@/models/TurmaModel';
import { UserSession } from '@/lib/session';
import { ForbiddenError, NotFoundError } from '@/lib/errors';

export class TurmaService {
  constructor(
    private turmaRepository: any = typeof window !== 'undefined' ? new TurmaRepository() : new PrismaTurmaRepository()
  ) {}

  async listarTurmas(session?: UserSession | null): Promise<TurmaModel[]> {
    if (session?.role === 'PROFESSOR') {
      return this.turmaRepository.findByProfessorId(session.id);
    }
    return this.turmaRepository.findAll();
  }

  async buscarPorId(id: string): Promise<TurmaModel | undefined> {
    return this.turmaRepository.findById(id);
  }

  async salvarTurma(dados: Partial<TurmaModel>, session?: UserSession | null): Promise<TurmaModel> {
    if (session?.role === 'PROFESSOR') {
      dados.professorId = session.id;
      dados.professorNome = session.name;
    }
    const turma = new TurmaModel(dados);
    return this.turmaRepository.save(turma);
  }

  async excluirTurma(id: string, session?: UserSession | null): Promise<boolean> {
    const turma = await this.turmaRepository.findById(id);
    if (!turma) {
      throw new NotFoundError('Turma não encontrada.');
    }

    if (session?.role === 'PROFESSOR' && turma.professorId !== session.id) {
      throw new ForbiddenError('Acesso negado. Você só pode excluir suas próprias turmas.');
    }

    return this.turmaRepository.delete(id);
  }
}
