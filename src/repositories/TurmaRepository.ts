import { TurmaModel } from '@/models/TurmaModel';

export class TurmaRepository {
  private turmas: TurmaModel[] = [
    new TurmaModel({
      id: 't1',
      nome: 'Engenharia de Software IV',
      curso: 'Engenharia de Software',
      semestre: '2026/2',
      codigoConvite: 'CAT-8842'
    }),
    new TurmaModel({
      id: 't2',
      nome: 'Arquitetura de Software',
      curso: 'Engenharia de Software',
      semestre: '2026/2',
      codigoConvite: 'CAT-9910'
    })
  ];

  async findAll(): Promise<TurmaModel[]> {
    return [...this.turmas];
  }

  async findById(id: string): Promise<TurmaModel | undefined> {
    return this.turmas.find(t => t.id === id);
  }

  async save(turma: TurmaModel): Promise<TurmaModel> {
    const index = this.turmas.findIndex(t => t.id === turma.id);
    if (index >= 0) {
      this.turmas[index] = turma;
    } else {
      this.turmas.push(turma);
    }
    return turma;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.turmas.length;
    this.turmas = this.turmas.filter(t => t.id !== id);
    return this.turmas.length < initialLength;
  }
}
