import { LeituraOMRRegistro } from '@/types';

export class OmrRepository {
  private leituras: LeituraOMRRegistro[] = [];

  async findAll(): Promise<LeituraOMRRegistro[]> {
    return [...this.leituras];
  }

  async findById(id: string): Promise<LeituraOMRRegistro | undefined> {
    return this.leituras.find(l => l.id === id);
  }

  async findByAlunoId(alunoId: string): Promise<LeituraOMRRegistro[]> {
    return this.leituras.filter(l => l.alunoId === alunoId);
  }

  async save(registro: LeituraOMRRegistro): Promise<LeituraOMRRegistro> {
    this.leituras.unshift(registro);
    return registro;
  }
}
