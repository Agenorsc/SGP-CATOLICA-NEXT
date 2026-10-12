import { OmrService } from '@/services/OmrService';
import { AlunoModel } from '@/models/AlunoModel';
import { TurmaModel } from '@/models/TurmaModel';
import { Question } from '@/types';

export class OmrController {
  constructor(private omrService: OmrService = new OmrService()) {}

  async getLeituras() {
    try {
      const data = await this.omrService.listarLeituras();
      return { status: 200, data };
    } catch (error: any) {
      return { status: 500, data: { error: error.message } };
    }
  }

  processar(
    aluno: AlunoModel,
    turma: TurmaModel,
    questoes: Question[],
    materia: string,
    versao: string = 'Versão A'
  ) {
    try {
      const registro = this.omrService.processarCorrecao(aluno, turma, questoes, materia, versao);
      return { status: 200, data: registro };
    } catch (error: any) {
      return { status: 500, data: { error: error.message } };
    }
  }
}
