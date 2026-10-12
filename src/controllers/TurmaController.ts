import { TurmaService } from '@/services/TurmaService';
import { TurmaModel } from '@/models/TurmaModel';

export class TurmaController {
  constructor(private turmaService: TurmaService = new TurmaService()) {}

  async getTurmas() {
    try {
      const data = await this.turmaService.listarTurmas();
      return { status: 200, data };
    } catch (error: any) {
      return { status: 500, data: { error: error.message } };
    }
  }

  async saveTurma(turmaData: Partial<TurmaModel>) {
    try {
      const saved = await this.turmaService.salvarTurma(turmaData);
      return { status: 200, data: saved };
    } catch (error: any) {
      return { status: 500, data: { error: error.message } };
    }
  }

  async deleteTurma(id: string) {
    try {
      const success = await this.turmaService.excluirTurma(id);
      return { status: 200, data: { success } };
    } catch (error: any) {
      return { status: 500, data: { error: error.message } };
    }
  }
}
