import { AlunoService } from '@/services/AlunoService';
import { AlunoModel } from '@/models/AlunoModel';

export class AlunoController {
  constructor(private alunoService: AlunoService = new AlunoService()) {}

  async getAlunos() {
    try {
      const data = await this.alunoService.listarAlunos();
      return { status: 200, data };
    } catch (error: any) {
      return { status: 500, data: { error: error.message } };
    }
  }

  async saveAluno(alunoData: Partial<AlunoModel>) {
    try {
      const saved = await this.alunoService.salvarAluno(alunoData);
      return { status: 200, data: saved };
    } catch (error: any) {
      return { status: 500, data: { error: error.message } };
    }
  }

  async deleteAluno(id: string) {
    try {
      const success = await this.alunoService.excluirAluno(id);
      return { status: 200, data: { success } };
    } catch (error: any) {
      return { status: 500, data: { error: error.message } };
    }
  }
}
