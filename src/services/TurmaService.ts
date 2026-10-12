import { TurmaRepository } from '@/repositories/TurmaRepository';
import { TurmaModel } from '@/models/TurmaModel';

export class TurmaService {
  constructor(private turmaRepository: TurmaRepository = new TurmaRepository()) {}

  async listarTurmas(): Promise<TurmaModel[]> {
    return this.turmaRepository.findAll();
  }

  async buscarPorId(id: string): Promise<TurmaModel | undefined> {
    return this.turmaRepository.findById(id);
  }

  async salvarTurma(dados: Partial<TurmaModel>): Promise<TurmaModel> {
    const turma = new TurmaModel(dados);
    return this.turmaRepository.save(turma);
  }

  async excluirTurma(id: string): Promise<boolean> {
    return this.turmaRepository.delete(id);
  }
}
